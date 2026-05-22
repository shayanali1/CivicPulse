const cron = require('node-cron');
const { db } = require('../db/client');

// SLA Rules — how long each status can sit before escalating
const SLA_RULES = {
  submitted: { maxDays: 3, nextStatus: 'under_review' },
  under_review: { maxDays: 7, nextStatus: 'escalated_l1' },
  escalated_l1: { maxDays: 14, nextStatus: 'escalated_l2' },
};

async function runEscalationCheck() {
  console.log('🔍 Running escalation check at:', new Date().toISOString());

  try {
    for (const [status, rule] of Object.entries(SLA_RULES)) {
      // Calculate the deadline — issues older than this get escalated
      const deadlineThreshold = new Date();
      deadlineThreshold.setDate(deadlineThreshold.getDate() - rule.maxDays);

      // Find all overdue issues with this status
      const overdueIssues = await db.query(
        `SELECT id, title, status, last_status_changed_at
         FROM issues
         WHERE status = $1
           AND last_status_changed_at < $2
           AND is_resolved = false`,
        [status, deadlineThreshold]
      );

      if (overdueIssues.rows.length === 0) {
        console.log(`✅ No overdue issues for status: ${status}`);
        continue;
      }

      console.log(`⚠️  Found ${overdueIssues.rows.length} overdue issues for status: ${status}`);

      // Escalate each overdue issue
      for (const issue of overdueIssues.rows) {
        await escalateIssue(issue, rule);
      }
    }

    console.log('✅ Escalation check complete');

  } catch (err) {
    console.error('❌ Escalation engine error:', err.message);
  }
}

async function escalateIssue(issue, rule) {
  try {
    // Update issue status
    await db.query(
      `UPDATE issues
       SET status = $1,
           last_status_changed_at = NOW(),
           escalation_level = escalation_level + 1,
           is_publicly_flagged = true
       WHERE id = $2`,
      [rule.nextStatus, issue.id]
    );

    // Log the escalation event in the timeline
    await db.query(
      `INSERT INTO issue_events
        (issue_id, event_type, old_status, new_status, triggered_by, note)
       VALUES ($1, 'auto_escalation', $2, $3, 'system', $4)`,
      [
        issue.id,
        issue.status,
        rule.nextStatus,
        `Automatically escalated after SLA deadline exceeded`
      ]
    );

    console.log(`🚨 Escalated issue "${issue.title}" from ${issue.status} → ${rule.nextStatus}`);

  } catch (err) {
    console.error(`❌ Failed to escalate issue ${issue.id}:`, err.message);
  }
}

// Run every hour at minute 0
// Cron syntax: minute hour day month weekday
// '0 * * * *' means: at minute 0 of every hour
cron.schedule('0 * * * *', () => {
  runEscalationCheck();
});

// Also export so we can test it manually
module.exports = { runEscalationCheck };