import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import axios from "axios";

const CATEGORY_CONFIG = {
  pothole: { color: "#EF4444", icon: "road", label: "Pothole" },
  water: { color: "#3B82F6", icon: "water_drop", label: "Water" },
  power: { color: "#F59E0B", icon: "bolt", label: "Power" },
  sewage: { color: "#8B5CF6", icon: "warning", label: "Sewage" },
  other: { color: "#6B7280", icon: "flag", label: "Other" },
};

const STATUS_CONFIG = {
  submitted: {
    color: "bg-gray-500",
    textColor: "text-gray-700 dark:text-gray-300",
    bg: "bg-gray-100 dark:bg-gray-800",
    label: "Submitted",
  },
  under_review: {
    color: "bg-yellow-500",
    textColor: "text-yellow-700 dark:text-yellow-300",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    label: "Under Review",
  },
  escalated_l1: {
    color: "bg-orange-500",
    textColor: "text-orange-700 dark:text-orange-300",
    bg: "bg-orange-100 dark:bg-orange-900/30",
    label: "Escalated",
  },
  escalated_l2: {
    color: "bg-red-500",
    textColor: "text-red-700 dark:text-red-300",
    bg: "bg-red-100 dark:bg-red-900/30",
    label: "Critical",
  },
  resolved: {
    color: "bg-green-500",
    textColor: "text-green-700 dark:text-green-300",
    bg: "bg-green-100 dark:bg-green-900/30",
    label: "Resolved",
  },
};

export default function DashboardPage() {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [activeNav, setActiveNav] = useState("overview");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!user) navigate("/login");
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/issues");
      setIssues(res.data);
    } catch (err) {
      console.error("Failed to fetch issues:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const filteredIssues = issues.filter((issue) => {
    const statusMatch = filterStatus === "all" || issue.status === filterStatus;
    const categoryMatch =
      filterCategory === "all" || issue.category === filterCategory;
    return statusMatch && categoryMatch;
  });

  const stats = {
    total: issues.length,
    pending: issues.filter(
      (i) => i.status === "submitted" || i.status === "under_review",
    ).length,
    escalated: issues.filter(
      (i) => i.status === "escalated_l1" || i.status === "escalated_l2",
    ).length,
    resolved: issues.filter((i) => i.status === "resolved").length,
  };

  const categoryCounts = Object.keys(CATEGORY_CONFIG).map((key) => ({
    key,
    label: CATEGORY_CONFIG[key].label,
    color: CATEGORY_CONFIG[key].color,
    count: issues.filter((i) => i.category === key).length,
  }));

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-[#0b1326] flex transition-colors duration-300">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
          .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; vertical-align: middle; }
          ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #424754; border-radius: 3px; }
        `}</style>

        {/* SIDEBAR */}
        <aside className="w-64 flex-shrink-0 bg-white dark:bg-[#0f1729] border-r border-gray-200 dark:border-[#424754] flex flex-col fixed h-full z-40">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-[#424754]">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[18px]">
                  location_city
                </span>
              </div>
              <span
                className="font-bold text-blue-500 text-lg"
                style={{ fontFamily: "Hanken Grotesk" }}
              >
                CivicPulse
              </span>
            </Link>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-7 w-7 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-900 dark:text-[#dae2fd]">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 p-4 space-y-1">
            {[
              { id: "overview", icon: "dashboard", label: "Overview" },
              { id: "issues", icon: "list_alt", label: "All Issues" },
              { id: "escalated", icon: "warning", label: "Escalated" },
              { id: "resolved", icon: "check_circle", label: "Resolved" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeNav === item.id ? "bg-blue-500 text-white" : "text-gray-600 dark:text-[#c2c6d6] hover:bg-gray-100 dark:hover:bg-[#1e293b]"}`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                {item.label}
                {item.id === "escalated" && stats.escalated > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {stats.escalated}
                  </span>
                )}
              </button>
            ))}

            <div className="pt-4 border-t border-gray-200 dark:border-[#424754] mt-4">
              <Link
                to="/map"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-[#c2c6d6] hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">
                  map
                </span>
                View Map
              </Link>
            </div>
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-[#424754] space-y-2">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-gray-600 dark:text-[#c2c6d6] hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">
                {isDark ? "light_mode" : "dark_mode"}
              </span>
              {isDark ? "Light Mode" : "Dark Mode"}
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">
                logout
              </span>
              Logout
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 ml-64 overflow-auto">
          {/* Top Bar */}
          <header className="bg-white/90 dark:bg-[#0b1326]/90 border-b border-gray-200 dark:border-[#424754] backdrop-blur-md sticky top-0 z-30 px-8 py-4 flex justify-between items-center">
            <div>
              <h1
                className="text-xl font-bold text-gray-900 dark:text-[#dae2fd]"
                style={{ fontFamily: "Hanken Grotesk" }}
              >
                {activeNav === "overview" && "Overview"}
                {activeNav === "issues" && "All Issues"}
                {activeNav === "escalated" && "Escalated Issues"}
                {activeNav === "resolved" && "Resolved Issues"}
              </h1>
              <p className="text-sm text-gray-500 dark:text-[#c2c6d6]">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <button
              onClick={fetchIssues}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-[#424754] rounded-xl text-sm text-gray-600 dark:text-[#c2c6d6] hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">
                refresh
              </span>
              Refresh
            </button>
          </header>

          <div className="p-8 space-y-8">
            {/* OVERVIEW TAB */}
            {activeNav === "overview" && (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      label: "Total Issues",
                      value: stats.total,
                      icon: "summarize",
                      color: "text-blue-500",
                      bg: "bg-blue-50 dark:bg-blue-900/20",
                    },
                    {
                      label: "Pending",
                      value: stats.pending,
                      icon: "pending",
                      color: "text-yellow-500",
                      bg: "bg-yellow-50 dark:bg-yellow-900/20",
                    },
                    {
                      label: "Escalated",
                      value: stats.escalated,
                      icon: "warning",
                      color: "text-red-500",
                      bg: "bg-red-50 dark:bg-red-900/20",
                    },
                    {
                      label: "Resolved",
                      value: stats.resolved,
                      icon: "check_circle",
                      color: "text-green-500",
                      bg: "bg-green-50 dark:bg-green-900/20",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-white dark:bg-[#171f33] border border-gray-200 dark:border-[#424754] rounded-2xl p-6 shadow-sm"
                    >
                      <div
                        className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}
                      >
                        <span
                          className={`material-symbols-outlined ${stat.color} text-[24px]`}
                        >
                          {stat.icon}
                        </span>
                      </div>
                      <div
                        className="text-3xl font-bold text-gray-900 dark:text-[#dae2fd] mb-1"
                        style={{ fontFamily: "Hanken Grotesk" }}
                      >
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-[#c2c6d6]">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Category Breakdown */}
                <div className="bg-white dark:bg-[#171f33] border border-gray-200 dark:border-[#424754] rounded-2xl p-6 shadow-sm">
                  <h2
                    className="text-lg font-bold text-gray-900 dark:text-[#dae2fd] mb-6"
                    style={{ fontFamily: "Hanken Grotesk" }}
                  >
                    Issues by Category
                  </h2>
                  <div className="space-y-4">
                    {categoryCounts.map((cat) => (
                      <div key={cat.key} className="flex items-center gap-4">
                        <div className="w-24 text-sm text-gray-600 dark:text-[#c2c6d6]">
                          {cat.label}
                        </div>
                        <div className="flex-1 bg-gray-100 dark:bg-[#0b1326] rounded-full h-3">
                          <div
                            className="h-3 rounded-full transition-all duration-500"
                            style={{
                              width:
                                issues.length > 0
                                  ? `${(cat.count / issues.length) * 100}%`
                                  : "0%",
                              backgroundColor: cat.color,
                            }}
                          />
                        </div>
                        <div className="w-8 text-sm font-bold text-gray-900 dark:text-[#dae2fd] text-right">
                          {cat.count}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Charts Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pie Chart - Issues by Category */}
                  <div className="bg-white dark:bg-[#171f33] border border-gray-200 dark:border-[#424754] rounded-2xl p-6 shadow-sm">
                    <h2
                      className="text-lg font-bold text-gray-900 dark:text-[#dae2fd] mb-6"
                      style={{ fontFamily: "Hanken Grotesk" }}
                    >
                      Category Distribution
                    </h2>
                    {issues.length === 0 ? (
                      <div className="flex items-center justify-center h-48">
                        <p className="text-gray-400 text-sm">No data yet</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={categoryCounts.filter((c) => c.count > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="count"
                          >
                            {categoryCounts
                              .filter((c) => c.count > 0)
                              .map((entry) => (
                                <Cell key={entry.key} fill={entry.color} />
                              ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: isDark ? "#171f33" : "#ffffff",
                              border: `1px solid ${isDark ? "#424754" : "#e5e7eb"}`,
                              borderRadius: "8px",
                              color: isDark ? "#dae2fd" : "#1f2937",
                            }}
                          />
                          <Legend
                            formatter={(value) => (
                              <span
                                style={{
                                  color: isDark ? "#c2c6d6" : "#6b7280",
                                  fontSize: "12px",
                                }}
                              >
                                {value}
                              </span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Bar Chart - Resolution Rate */}
                  <div className="bg-white dark:bg-[#171f33] border border-gray-200 dark:border-[#424754] rounded-2xl p-6 shadow-sm">
                    <h2
                      className="text-lg font-bold text-gray-900 dark:text-[#dae2fd] mb-6"
                      style={{ fontFamily: "Hanken Grotesk" }}
                    >
                      Issue Status Overview
                    </h2>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart
                        data={[
                          {
                            name: "Submitted",
                            count: issues.filter(
                              (i) => i.status === "submitted",
                            ).length,
                            fill: "#6B7280",
                          },
                          {
                            name: "In Review",
                            count: issues.filter(
                              (i) => i.status === "under_review",
                            ).length,
                            fill: "#F59E0B",
                          },
                          {
                            name: "Escalated",
                            count: issues.filter(
                              (i) =>
                                i.status === "escalated_l1" ||
                                i.status === "escalated_l2",
                            ).length,
                            fill: "#EF4444",
                          },
                          {
                            name: "Resolved",
                            count: issues.filter((i) => i.status === "resolved")
                              .length,
                            fill: "#22C55E",
                          },
                        ]}
                        margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                      >
                        <XAxis
                          dataKey="name"
                          tick={{
                            fill: isDark ? "#c2c6d6" : "#6b7280",
                            fontSize: 11,
                          }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{
                            fill: isDark ? "#c2c6d6" : "#6b7280",
                            fontSize: 11,
                          }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDark ? "#171f33" : "#ffffff",
                            border: `1px solid ${isDark ? "#424754" : "#e5e7eb"}`,
                            borderRadius: "8px",
                            color: isDark ? "#dae2fd" : "#1f2937",
                          }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {[
                            { fill: "#6B7280" },
                            { fill: "#F59E0B" },
                            { fill: "#EF4444" },
                            { fill: "#22C55E" },
                          ].map((entry, index) => (
                            <Cell key={index} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Issues */}
                <div className="bg-white dark:bg-[#171f33] border border-gray-200 dark:border-[#424754] rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h2
                      className="text-lg font-bold text-gray-900 dark:text-[#dae2fd]"
                      style={{ fontFamily: "Hanken Grotesk" }}
                    >
                      Recent Issues
                    </h2>
                    <button
                      onClick={() => setActiveNav("issues")}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      View all
                    </button>
                  </div>
                  <IssuesTable
                    issues={issues.slice(0, 5)}
                    formatDate={formatDate}
                    onStatusUpdate={fetchIssues}
                  />
                </div>
              </>
            )}

            {/* ISSUES TAB */}
            {(activeNav === "issues" ||
              activeNav === "escalated" ||
              activeNav === "resolved") && (
              <div className="bg-white dark:bg-[#171f33] border border-gray-200 dark:border-[#424754] rounded-2xl p-6 shadow-sm">
                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-gray-50 dark:bg-[#0b1326] border border-gray-200 dark:border-[#424754] rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-[#dae2fd] outline-none focus:border-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-gray-50 dark:bg-[#0b1326] border border-gray-200 dark:border-[#424754] rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-[#dae2fd] outline-none focus:border-blue-500"
                  >
                    <option value="all">All Categories</option>
                    {Object.entries(CATEGORY_CONFIG).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm text-gray-500 dark:text-[#c2c6d6] self-center ml-2">
                    {filteredIssues.length} issues found
                  </span>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <span className="material-symbols-outlined animate-spin text-blue-500 text-[48px]">
                      progress_activity
                    </span>
                  </div>
                ) : (
                  <IssuesTable
                    issues={
                      activeNav === "escalated"
                        ? filteredIssues.filter(
                            (i) =>
                              i.status === "escalated_l1" ||
                              i.status === "escalated_l2",
                          )
                        : activeNav === "resolved"
                          ? filteredIssues.filter(
                              (i) => i.status === "resolved",
                            )
                          : filteredIssues
                    }
                    formatDate={formatDate}
                    onStatusUpdate={fetchIssues}
                  />
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function IssuesTable({ issues, formatDate, onStatusUpdate }) {
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState({});

  const handleStatusUpdate = async (issueId, newStatus) => {
    setUpdatingId(issueId);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/api/issues/${issueId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onStatusUpdate();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (issues.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-gray-300 dark:text-[#424754] text-[48px] block mb-3">
          inbox
        </span>
        <p className="text-gray-500 dark:text-[#c2c6d6]">No issues found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-[#424754]">
            {[
              "Title",
              "Category",
              "Status",
              "Upvotes",
              "Date",
              "Update Status",
              "Action",
            ].map((h) => (
              <th
                key={h}
                className="text-left text-xs font-semibold text-gray-500 dark:text-[#c2c6d6] uppercase tracking-wider pb-3 pr-4"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-[#424754]">
          {issues.map((issue) => {
            const cat =
              CATEGORY_CONFIG[issue.category] || CATEGORY_CONFIG.other;
            const stat = STATUS_CONFIG[issue.status] || STATUS_CONFIG.submitted;
            return (
              <tr
                key={issue.id}
                className="hover:bg-gray-50 dark:hover:bg-[#0b1326] transition-colors"
              >
                <td className="py-4 pr-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-[#dae2fd] truncate max-w-[160px]">
                    {issue.title}
                  </p>
                </td>
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="material-symbols-outlined text-[16px]"
                      style={{ color: cat.color }}
                    >
                      {cat.icon}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-[#c2c6d6]">
                      {cat.label}
                    </span>
                  </div>
                </td>
                <td className="py-4 pr-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${stat.bg} ${stat.textColor}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${stat.color}`}
                    ></span>
                    {stat.label}
                  </span>
                </td>
                <td className="py-4 pr-4">
                  <span className="text-sm text-gray-600 dark:text-[#c2c6d6] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">
                      thumb_up
                    </span>
                    {issue.upvote_count}
                  </span>
                </td>
                <td className="py-4 pr-4">
                  <span className="text-sm text-gray-500 dark:text-[#c2c6d6]">
                    {formatDate(issue.created_at)}
                  </span>
                </td>
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedStatus[issue.id] || issue.status}
                      onChange={(e) =>
                        setSelectedStatus({
                          ...selectedStatus,
                          [issue.id]: e.target.value,
                        })
                      }
                      className="bg-gray-50 dark:bg-[#0b1326] border border-gray-200 dark:border-[#424754] rounded-lg px-2 py-1 text-xs text-gray-900 dark:text-[#dae2fd] outline-none focus:border-blue-500"
                    >
                      {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                        <option key={key} value={key}>
                          {val.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() =>
                        handleStatusUpdate(
                          issue.id,
                          selectedStatus[issue.id] || issue.status,
                        )
                      }
                      disabled={
                        updatingId === issue.id ||
                        (selectedStatus[issue.id] || issue.status) ===
                          issue.status
                      }
                      className="px-2 py-1 bg-blue-500 text-white rounded-lg text-xs font-medium hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                    >
                      {updatingId === issue.id ? (
                        <span className="material-symbols-outlined animate-spin text-[14px]">
                          progress_activity
                        </span>
                      ) : (
                        <span className="material-symbols-outlined text-[14px]">
                          check
                        </span>
                      )}
                      Apply
                    </button>
                  </div>
                </td>
                <td className="py-4">
                  <Link
                    to={`/issues/${issue.id}`}
                    className="text-xs text-blue-500 font-medium hover:underline flex items-center gap-1"
                  >
                    View{" "}
                    <span className="material-symbols-outlined text-[14px]">
                      arrow_forward
                    </span>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
