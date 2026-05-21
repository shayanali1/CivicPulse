import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

const CATEGORY_CONFIG = {
  pothole: { color: '#EF4444', icon: 'road', label: 'Pothole' },
  water: { color: '#3B82F6', icon: 'water_drop', label: 'Water' },
  power: { color: '#F59E0B', icon: 'bolt', label: 'Power' },
  sewage: { color: '#8B5CF6', icon: 'warning', label: 'Sewage' },
  other: { color: '#6B7280', icon: 'flag', label: 'Other' },
};

const STATUS_CONFIG = {
  submitted: { color: 'bg-gray-500', textColor: 'text-gray-700 dark:text-gray-300', bg: 'bg-gray-100 dark:bg-gray-800', label: 'Submitted' },
  under_review: { color: 'bg-yellow-500', textColor: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Under Review' },
  escalated_l1: { color: 'bg-orange-500', textColor: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-100 dark:bg-orange-900/30', label: 'Escalated' },
  escalated_l2: { color: 'bg-red-500', textColor: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Critical' },
  resolved: { color: 'bg-green-500', textColor: 'text-green-700 dark:text-green-300', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Resolved' },
};

const EVENT_CONFIG = {
  submitted: { icon: 'add_circle', color: 'text-blue-500', label: 'Issue Submitted' },
  status_change: { icon: 'sync', color: 'text-yellow-500', label: 'Status Changed' },
  auto_escalation: { icon: 'warning', color: 'text-red-500', label: 'Auto Escalated' },
  resolved: { icon: 'check_circle', color: 'text-green-500', label: 'Resolved' },
};

export default function IssueDetailPage() {
  const { isDark, toggleTheme } = useTheme();
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);

  useEffect(() => {
    fetchIssue();
  }, [id]);

  const fetchIssue = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/issues/${id}`);
      setIssue(res.data);
      setUpvoteCount(res.data.upvote_count);
    } catch (err) {
      console.error('Failed to fetch issue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = () => {
    if (upvoted) {
      setUpvoteCount(upvoteCount - 1);
    } else {
      setUpvoteCount(upvoteCount + 1);
    }
    setUpvoted(!upvoted);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={isDark ? 'dark' : ''}>
        <div className="min-h-screen bg-gray-50 dark:bg-[#0b1326] flex items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-blue-500 text-[48px]">progress_activity</span>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className={isDark ? 'dark' : ''}>
        <div className="min-h-screen bg-gray-50 dark:bg-[#0b1326] flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-gray-300 text-[64px] block mb-4">location_off</span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-[#dae2fd] mb-2">Issue not found</h2>
            <Link to="/map" className="text-blue-500 hover:underline">Back to map</Link>
          </div>
        </div>
      </div>
    );
  }

  const category = CATEGORY_CONFIG[issue.category] || CATEGORY_CONFIG.other;
  const status = STATUS_CONFIG[issue.status] || STATUS_CONFIG.submitted;

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-[#0b1326] transition-colors duration-300">

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
          .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; vertical-align: middle; }
        `}</style>

        {/* NAVBAR */}
        <header className="bg-white/90 dark:bg-[#0b1326]/90 border-b border-gray-200 dark:border-[#424754] backdrop-blur-md sticky top-0 z-50">
          <nav className="flex justify-between items-center px-6 py-3 max-w-4xl mx-auto">
            <Link to="/map" className="flex items-center gap-2 text-gray-600 dark:text-[#c2c6d6] hover:text-blue-500 transition-colors">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              <span className="text-sm font-medium">Back to Map</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[16px]">location_city</span>
              </div>
              <span className="font-bold text-blue-500 hidden sm:block" style={{ fontFamily: 'Hanken Grotesk' }}>CivicPulse</span>
            </div>
            <button onClick={toggleTheme} className="p-2 rounded-lg border border-gray-200 dark:border-[#424754] hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-colors">
              <span className="material-symbols-outlined text-gray-600 dark:text-[#c2c6d6] text-[20px]">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </nav>
        </header>

        <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">

          {/* Issue Header Card */}
          <div className="bg-white dark:bg-[#171f33] border border-gray-200 dark:border-[#424754] rounded-2xl p-8 shadow-sm">
            {/* Category + Status badges */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                style={{ backgroundColor: category.color + '20', color: category.color }}>
                <span className="material-symbols-outlined text-[16px]">{category.icon}</span>
                {category.label}
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.textColor}`}>
                <span className={`inline-flex h-2 w-2 rounded-full ${status.color}`}></span>
                {status.label}
              </div>
              {issue.is_publicly_flagged && (
                <div className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                  <span className="material-symbols-outlined text-[16px]">flag</span>
                  Publicly Flagged
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-[#dae2fd] mb-4" style={{ fontFamily: 'Hanken Grotesk' }}>
              {issue.title}
            </h1>

            {/* Meta info */}
            <div className="flex flex-wrap gap-6 text-sm text-gray-500 dark:text-[#c2c6d6] mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">person</span>
                Reported by <span className="font-medium text-gray-700 dark:text-[#dae2fd] ml-1">{issue.reporter_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                {formatDate(issue.created_at)}
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                {Number(issue.lat).toFixed(4)}, {Number(issue.lng).toFixed(4)}
              </div>
            </div>

            {/* Description */}
            {issue.description && (
              <div className="bg-gray-50 dark:bg-[#0b1326] rounded-xl p-4 mb-6">
                <p className="text-gray-700 dark:text-[#c2c6d6] leading-relaxed">{issue.description}</p>
              </div>
            )}

            {/* Upvote + Escalation level */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleUpvote}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl border-2 font-medium transition-all ${upvoted ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-500' : 'border-gray-200 dark:border-[#424754] text-gray-600 dark:text-[#c2c6d6] hover:border-blue-300'}`}
              >
                <span className="material-symbols-outlined text-[20px]">{upvoted ? 'thumb_up' : 'thumb_up'}</span>
                <span>{upvoteCount} Upvotes</span>
              </button>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-[#c2c6d6]">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                Escalation Level: <span className="font-bold text-gray-900 dark:text-[#dae2fd] ml-1">{issue.escalation_level}</span>
              </div>
            </div>
          </div>

          {/* Timeline Card */}
          <div className="bg-white dark:bg-[#171f33] border border-gray-200 dark:border-[#424754] rounded-2xl p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-[#dae2fd] mb-6 flex items-center gap-2" style={{ fontFamily: 'Hanken Grotesk' }}>
              <span className="material-symbols-outlined text-blue-500">timeline</span>
              Public Accountability Trail
            </h2>

            {issue.timeline && issue.timeline.length > 0 ? (
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-[#424754]"></div>

                <div className="space-y-6">
                  {issue.timeline.map((event, index) => {
                    const eventConfig = EVENT_CONFIG[event.event_type] || EVENT_CONFIG.status_change;
                    return (
                      <div key={index} className="flex gap-4 relative">
                        {/* Icon */}
                        <div className="h-10 w-10 rounded-full bg-white dark:bg-[#171f33] border-2 border-gray-200 dark:border-[#424754] flex items-center justify-center flex-shrink-0 z-10">
                          <span className={`material-symbols-outlined text-[18px] ${eventConfig.color}`}>
                            {eventConfig.icon}
                          </span>
                        </div>
                        {/* Content */}
                        <div className="flex-1 bg-gray-50 dark:bg-[#0b1326] rounded-xl p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-[#dae2fd] text-sm">{eventConfig.label}</p>
                              {event.new_status && (
                                <p className="text-xs text-gray-500 dark:text-[#c2c6d6] mt-1">
                                  Status: <span className="font-medium capitalize">{event.new_status.replace('_', ' ')}</span>
                                </p>
                              )}
                              {event.note && (
                                <p className="text-xs text-gray-500 dark:text-[#c2c6d6] mt-1">{event.note}</p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">
                                By: {event.triggered_by === 'system' ? '🤖 System' : '👤 User'}
                              </p>
                            </div>
                            <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                              {formatDate(event.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-gray-300 text-[48px] block mb-3">history</span>
                <p className="text-gray-500 dark:text-[#c2c6d6]">No timeline events yet</p>
              </div>
            )}
          </div>

          {/* Location Card */}
          <div className="bg-white dark:bg-[#171f33] border border-gray-200 dark:border-[#424754] rounded-2xl p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-[#dae2fd] mb-4 flex items-center gap-2" style={{ fontFamily: 'Hanken Grotesk' }}>
              <span className="material-symbols-outlined text-blue-500">location_on</span>
              Issue Location
            </h2>
            <div className="bg-gray-50 dark:bg-[#0b1326] rounded-xl p-4 flex items-center gap-4">
              <span className="material-symbols-outlined text-blue-500 text-[32px]">map</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-[#dae2fd]">GPS Coordinates</p>
                <p className="text-sm text-gray-500 dark:text-[#c2c6d6]">
                  Latitude: {Number(issue.lat).toFixed(6)} | Longitude: {Number(issue.lng).toFixed(6)}
                </p>
              </div>
              <Link
                to="/map"
                className="ml-auto text-sm text-blue-500 font-medium hover:underline flex items-center gap-1"
              >
                View on map
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}