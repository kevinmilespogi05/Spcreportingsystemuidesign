import { useState, useMemo, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  FileText,
  Download,
  Calendar,
} from "lucide-react";
import { motion } from "motion/react";
import { useApp } from "../../context/AppContext";
import {
  calculateMonthlyData,
  calculateCategoryData,
  calculateResolutionTime,
  calculateWeeklyData,
  calculateKPIMetrics,
  getDateRangeText,
} from "../../../lib/analyticsUtils";

type AnalyticsSummary = {
  executiveSummary: string;
  keyFindings: string[];
  topConcerns: string[];
  recommendations: string[];
  trend: "up" | "flat" | "down";
};

const DEFAULT_SUMMARY: AnalyticsSummary = {
  executiveSummary:
    "Complaint activity is stable with opportunities to reduce pending backlogs through targeted interventions.",
  keyFindings: [
    "Most reports are concentrated in a small number of recurring categories.",
    "Pending complaints indicate capacity pressure in peak reporting periods.",
    "Resolution performance improves when triage is completed within 24 hours.",
  ],
  topConcerns: ["Backlog growth in high-volume categories", "Delayed first-response times"],
  recommendations: [
    "Assign rotating rapid-response teams for top recurring categories.",
    "Automate routing and prioritization for high-severity complaints.",
    "Review unresolved cases older than 7 days in weekly operations meetings.",
  ],
  trend: "flat",
};

const COLORS = {
  Pending: "#f59e0b",
  "In Progress": "#3b82f6",
  Resolved: "#10b981",
  Rejected: "#ef4444",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs">
        <p className="text-slate-600 mb-2">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-500">{entry.name}:</span>
            <span className="text-slate-800">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function AdminAnalyticsPage() {
  const { complaints, fetchAllComplaints, user } = useApp();
  const [dateRange, setDateRange] = useState("6months");
  const [aiSummary, setAiSummary] = useState<AnalyticsSummary>(DEFAULT_SUMMARY);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Fetch all complaints on component mount
  useEffect(() => {
    if (user?.role === "admin") {
      fetchAllComplaints();
    }
  }, [user, fetchAllComplaints]);

  const monthlyData = useMemo(() => calculateMonthlyData(complaints, dateRange), [complaints, dateRange]);
  const categoryChartData = useMemo(() => calculateCategoryData(complaints), [complaints]);
  const resolutionTimeData = useMemo(() => calculateResolutionTime(complaints), [complaints]);
  const weeklyData = useMemo(() => calculateWeeklyData(complaints), [complaints]);
  const kpiMetrics = useMemo(() => calculateKPIMetrics(complaints), [complaints]);

  const summaryStats = useMemo(() => {
    const categoryCounts = categoryChartData.map(({ category, count }) => ({ category, count }));
    const statusCounts = {
      resolved: complaints.filter((c) => c.status === "Resolved").length,
      inProgress: complaints.filter((c) => c.status === "In Progress").length,
      pending: complaints.filter((c) => c.status === "Pending").length,
      rejected: complaints.filter((c) => c.status === "Rejected").length,
    };

    return {
      totalComplaints: complaints.length,
      statusCounts,
      categoryCounts,
      averageResolutionDays: kpiMetrics.avgResolutionDays,
      resolutionRate: kpiMetrics.resolutionRate,
      monthlyData,
      weeklyData,
    };
  }, [complaints, categoryChartData, kpiMetrics, monthlyData, weeklyData]);

  const summaryStatsKey = useMemo(() => JSON.stringify(summaryStats), [summaryStats]);

  useEffect(() => {
    if (!complaints.length) {
      setAiSummary(DEFAULT_SUMMARY);
      setSummaryError(null);
      return;
    }

    const controller = new AbortController();
    const fetchSummary = async () => {
      setIsSummaryLoading(true);
      setSummaryError(null);

      try {
        const response = await fetch("/api/analytics-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dateRange: getDateRangeText(dateRange),
            stats: summaryStats,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        setAiSummary({
          executiveSummary: data.executiveSummary || DEFAULT_SUMMARY.executiveSummary,
          keyFindings: Array.isArray(data.keyFindings) ? data.keyFindings : DEFAULT_SUMMARY.keyFindings,
          topConcerns: Array.isArray(data.topConcerns) ? data.topConcerns : DEFAULT_SUMMARY.topConcerns,
          recommendations: Array.isArray(data.recommendations) ? data.recommendations : DEFAULT_SUMMARY.recommendations,
          trend: data.trend === "up" || data.trend === "down" ? data.trend : "flat",
        });
      } catch (error) {
        console.error("Failed to load analytics summary", error);
        setAiSummary(DEFAULT_SUMMARY);
        setSummaryError("Unable to load AI summary. Showing default insights.");
      } finally {
        setIsSummaryLoading(false);
      }
    };

    fetchSummary();
    return () => controller.abort();
  }, [dateRange, summaryStatsKey, complaints.length]);

  const statusData = [
    { name: "Resolved", value: complaints.filter((c) => c.status === "Resolved").length },
    { name: "In Progress", value: complaints.filter((c) => c.status === "In Progress").length },
    { name: "Pending", value: complaints.filter((c) => c.status === "Pending").length },
    { name: "Rejected", value: complaints.filter((c) => c.status === "Rejected").length },
  ].filter((d) => d.value > 0);

  const kpis = [
    {
      label: "Total Reports",
      value: kpiMetrics.totalReports,
      icon: FileText,
      color: "text-slate-600",
      bg: "bg-slate-100",
      border: "border-slate-200",
      trend: kpiMetrics.trendPercent + " vs last period",
      trendColor: "text-emerald-600",
    },
    {
      label: "Avg. Resolution Time",
      value: kpiMetrics.avgResolutionDays,
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      trend: kpiMetrics.trendLabel,
      trendColor: "text-emerald-600",
    },
    {
      label: "Resolution Rate",
      value: kpiMetrics.resolutionRate,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      trend: "+5% vs last month",
      trendColor: "text-emerald-600",
    },
    {
      label: "Pending & In Progress",
      value: `${kpiMetrics.pendings + kpiMetrics.inProgress}`,
      icon: TrendingUp,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
      trend: `${kpiMetrics.pendings} pending, ${kpiMetrics.inProgress} in progress`,
      trendColor: "text-slate-400",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-800">Reports & Analytics</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {getDateRangeText(dateRange)} • {complaints.length} total complaints
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
              {[
                { label: "1M", value: "1month" },
                { label: "3M", value: "3months" },
                { label: "6M", value: "6months" },
                { label: "1Y", value: "1year" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDateRange(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                    dateRange === opt.value
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 border border-slate-200 text-slate-600 hover:bg-slate-50 px-3.5 py-2 rounded-xl text-sm transition-all">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6 max-w-7xl mx-auto">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`bg-white rounded-xl border ${kpi.border} p-4 shadow-sm`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 ${kpi.bg} rounded-lg flex items-center justify-center`}>
                  <kpi.icon className={`w-4.5 h-4.5 ${kpi.color}`} />
                </div>
              </div>
              <p className={`text-2xl ${kpi.color}`}>{kpi.value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{kpi.label}</p>
              <p className={`text-xs mt-1 ${kpi.trendColor}`}>{kpi.trend}</p>
            </motion.div>
          ))}
        </div>

        {/* AI Analytics Summary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h3 className="text-slate-700">AI Insights</h3>
              <p className="text-xs text-slate-400 mt-0.5">AI-generated summary based on current complaint analytics.</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {isSummaryLoading ? (
                <span>Refreshing summary…</span>
              ) : (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 uppercase tracking-[0.2em]">
                  {aiSummary.trend}
                </span>
              )}
            </div>
          </div>

          <p className="text-sm text-slate-700 leading-7">{aiSummary.executiveSummary}</p>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <h4 className="text-slate-900 text-sm font-semibold mb-2">Key Findings</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                {aiSummary.keyFindings.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1 text-slate-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <h4 className="text-slate-900 text-sm font-semibold mb-2">Top Concerns</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                {aiSummary.topConcerns.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1 text-slate-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <h4 className="text-slate-900 text-sm font-semibold mb-2">Recommendations</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                {aiSummary.recommendations.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1 text-slate-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {summaryError ? <p className="mt-4 text-xs text-rose-600">{summaryError}</p> : null}
        </motion.div>

        {/* Complaints Over Time - Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-slate-700">Complaints Over Time</h3>
              <p className="text-xs text-slate-400 mt-0.5">Monthly submitted vs resolved</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#1e3a5f]" />
                <span className="text-slate-500">Submitted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-500">Resolved</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <span className="text-slate-500">In Progress</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="submitted" name="Submitted" stroke="#1e3a5f" strokeWidth={2} fill="url(#colorSubmitted)" />
              <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" strokeWidth={2} fill="url(#colorResolved)" />
              <Area type="monotone" dataKey="inProgress" name="In Progress" stroke="#3b82f6" strokeWidth={2} fill="none" strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Complaints by Category */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5"
          >
            <div className="mb-5">
              <h3 className="text-slate-700">By Category</h3>
              <p className="text-xs text-slate-400 mt-0.5">Complaint volume per category</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryChartData} margin={{ top: 0, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 9, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Complaints" radius={[4, 4, 0, 0]}>
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Status Distribution - Pie */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5"
          >
            <div className="mb-5">
              <h3 className="text-slate-700">Status Distribution</h3>
              <p className="text-xs text-slate-400 mt-0.5">Current complaint statuses</p>
            </div>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={COLORS[entry.name as keyof typeof COLORS]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2.5">
                {statusData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[entry.name as keyof typeof COLORS] }}
                      />
                      <span className="text-xs text-slate-600">{entry.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-800">{entry.value}</span>
                      <span className="text-xs text-slate-400">
                        ({Math.round((entry.value / complaints.length) * 100)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Resolution Time by Category */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-slate-700">Average Resolution Time</h3>
              <p className="text-xs text-slate-400 mt-0.5">Days from submission to resolution by category</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={resolutionTimeData}
              layout="vertical"
              margin={{ top: 0, right: 40, left: 100, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="category"
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                width={95}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avgDays" name="Avg Days" radius={[0, 4, 4, 0]} fill="#1e3a5f" opacity={0.8}>
                {resolutionTimeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.avgDays > 15 ? "#ef4444" : entry.avgDays > 8 ? "#f59e0b" : "#10b981"}
                    opacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded bg-emerald-500" /> ≤8 days (Fast)</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded bg-amber-500" /> 9–15 days (Normal)</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded bg-red-500" /> &gt;15 days (Slow)</div>
          </div>
        </motion.div>

        {/* Weekly New vs Closed */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-5"
        >
          <div className="mb-5">
            <h3 className="text-slate-700">Weekly Activity</h3>
            <p className="text-xs text-slate-400 mt-0.5">New complaints vs. closed this month</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
              <Bar dataKey="new" name="New Complaints" fill="#f59e0b" radius={[3, 3, 0, 0]} opacity={0.85} />
              <Bar dataKey="closed" name="Closed" fill="#10b981" radius={[3, 3, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Summary Table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-slate-700">Monthly Summary</h3>
            <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
              <Calendar className="w-3.5 h-3.5" />
              View Full Report
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  {["Month", "Submitted", "In Progress", "Resolved", "Resolution Rate"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthlyData.map((row, i) => {
                  const rate = Math.round((row.resolved / row.submitted) * 100);
                  return (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 text-sm text-slate-700">{row.month} 2024</td>
                      <td className="px-5 py-3 text-sm text-slate-700">{row.submitted}</td>
                      <td className="px-5 py-3 text-sm text-blue-600">{row.inProgress}</td>
                      <td className="px-5 py-3 text-sm text-emerald-600">{row.resolved}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[80px]">
                            <div
                              className={`h-full rounded-full ${rate >= 70 ? "bg-emerald-500" : rate >= 50 ? "bg-amber-400" : "bg-red-400"}`}
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          <span className={`text-xs ${rate >= 70 ? "text-emerald-600" : rate >= 50 ? "text-amber-600" : "text-red-600"}`}>
                            {rate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
