const { db } = require("./client");

async function migrate() {
  try {
    // Create users table first (issues table depends on it)
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'citizen',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    console.log("✅ Users table ready");

    // Create issues table
    await db.query(`
      CREATE TABLE IF NOT EXISTS issues (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        location GEOGRAPHY(Point, 4326) NOT NULL,
        status TEXT NOT NULL DEFAULT 'submitted',
        escalation_level INTEGER NOT NULL DEFAULT 0,
        is_publicly_flagged BOOLEAN NOT NULL DEFAULT false,
        upvote_count INTEGER NOT NULL DEFAULT 0,
        reporter_id UUID REFERENCES users(id),
        assigned_to UUID REFERENCES users(id),
        last_status_changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        resolved_at TIMESTAMPTZ,
        is_resolved BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    console.log("✅ Issues table ready");

    // Create issue_events table
    await db.query(`
      CREATE TABLE IF NOT EXISTS issue_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
        event_type TEXT NOT NULL,
        old_status TEXT,
        new_status TEXT,
        triggered_by TEXT NOT NULL,
        note TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    console.log("✅ Issue events table ready");

    // Create indexes for performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_issues_location 
      ON issues USING GIST(location)
    `);
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_issues_status_time 
      ON issues(status, last_status_changed_at) 
      WHERE is_resolved = false
    `);
    console.log("✅ Indexes ready");
    // Create area_assignments table
    await db.query(`
  CREATE TABLE IF NOT EXISTS area_assignments (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID REFERENCES users(id),
    coverage_area GEOMETRY(Polygon, 4326) NOT NULL
  )
`);
    console.log("✅ Area assignments table ready");

    // Create GIST index for geographic queries
    await db.query(`
  CREATE INDEX IF NOT EXISTS idx_area_assignments_geom 
  ON area_assignments USING GIST(coverage_area)
`);
    console.log("✅ Area assignments index ready");
    // Add photo_url column to issues table
await db.query(`
  ALTER TABLE issues 
  ADD COLUMN IF NOT EXISTS photo_url TEXT
`);
console.log('✅ Photo URL column ready');
    console.log("🎉 Database migration complete!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  }
}

migrate();
