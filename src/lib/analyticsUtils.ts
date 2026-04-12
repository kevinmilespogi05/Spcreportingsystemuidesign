import { Complaint } from "./complaintService";

// Get the number of months back to include
const getMonthsBack = (dateRange: string): number => {
  switch (dateRange) {
    case "1month":
      return 1;
    case "3months":
      return 3;
    case "1year":
      return 12;
    case "6months":
    default:
      return 6;
  }
};

// Generate month labels for the past N months
const getMonthLabels = (monthsBack: number): string[] => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const labels: string[] = [];
  const now = new Date();

  for (let i = monthsBack - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i);
    labels.push(months[date.getMonth()]);
  }

  return labels;
};

// Get complaints in a specific month
const getComplaintsInMonth = (complaints: Complaint[], year: number, month: number): Complaint[] => {
  return complaints.filter((c) => {
    const date = new Date(c.created_at);
    return date.getFullYear() === year && date.getMonth() === month;
  });
};

// Calculate monthly data for analytics
export const calculateMonthlyData = (complaints: Complaint[], dateRange: string) => {
  const monthsBack = getMonthsBack(dateRange);
  const now = new Date();
  const labels = getMonthLabels(monthsBack);
  const monthlyData = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i);
    const monthComplaints = getComplaintsInMonth(complaints, date.getFullYear(), date.getMonth());

    monthlyData.push({
      month: labels[monthsBack - 1 - i],
      submitted: monthComplaints.length,
      resolved: monthComplaints.filter((c) => c.status === "Resolved").length,
      inProgress: monthComplaints.filter((c) => c.status === "In Progress").length,
      pending: monthComplaints.filter((c) => c.status === "Pending").length,
      rejected: monthComplaints.filter((c) => c.status === "Rejected").length,
    });
  }

  return monthlyData;
};

// Calculate category breakdown
export const calculateCategoryData = (complaints: Complaint[]) => {
  const categoryMap = new Map<string, number>();
  const categoryColors: Record<string, string> = {
    "Road & Infrastructure": "#3b82f6",
    "Waste Management": "#10b981",
    "Public Safety": "#f59e0b",
    "Noise Complaint": "#8b5cf6",
    "Street Lighting": "#eab308",
    "Water & Drainage": "#06b6d4",
    "Public Health": "#ef4444",
    Other: "#94a3b8",
  };

  complaints.forEach((c) => {
    const count = categoryMap.get(c.category) || 0;
    categoryMap.set(c.category, count + 1);
  });

  return Array.from(categoryMap.entries()).map(([category, count]) => ({
    category,
    count,
    color: categoryColors[category] || "#64748b",
  }));
};

// Calculate average resolution time by category
export const calculateResolutionTime = (complaints: Complaint[]) => {
  const categoryMap = new Map<string, { totalDays: number; count: number }>();

  complaints
    .filter((c) => c.status === "Resolved")
    .forEach((c) => {
      const submittedDate = new Date(c.created_at);
      const resolvedDate = new Date(c.updated_at);
      const daysToResolve = Math.ceil(
        (resolvedDate.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const current = categoryMap.get(c.category) || { totalDays: 0, count: 0 };
      categoryMap.set(c.category, {
        totalDays: current.totalDays + daysToResolve,
        count: current.count + 1,
      });
    });

  return Array.from(categoryMap.entries())
    .map(([category, { totalDays, count }]) => ({
      category,
      avgDays: Math.round(totalDays / count) || 0,
    }))
    .sort((a, b) => b.avgDays - a.avgDays);
};

// Calculate weekly activity
export const calculateWeeklyData = (complaints: Complaint[]) => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());

  const weeklyData = [];

  for (let week = 0; week < 4; week++) {
    const weekStart = new Date(startOfWeek);
    weekStart.setDate(weekStart.getDate() - (3 - week) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const newComplaints = complaints.filter((c) => {
      const date = new Date(c.created_at);
      return date >= weekStart && date <= weekEnd;
    }).length;

    const closed = complaints.filter((c) => {
      const date = new Date(c.updated_at);
      return date >= weekStart && date <= weekEnd && (c.status === "Resolved" || c.status === "Rejected");
    }).length;

    weeklyData.push({
      week: `Wk ${week + 1}`,
      new: newComplaints,
      closed,
    });
  }

  return weeklyData;
};

// Calculate KPI metrics
export const calculateKPIMetrics = (complaints: Complaint[], previousComplaints?: Complaint[]) => {
  const totalReports = complaints.length;
  const resolvedComplaints = complaints.filter((c) => c.status === "Resolved");
  
  // Calculate average resolution time
  const resolutionTimes = resolvedComplaints
    .map((c) => {
      const submittedDate = new Date(c.created_at);
      const resolvedDate = new Date(c.updated_at);
      return (resolvedDate.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24);
    });

  const avgResolutionDays = 
    resolutionTimes.length > 0
      ? (resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length).toFixed(1)
      : "0";

  // Calculate resolution rate
  const resolutionRate = 
    complaints.length > 0
      ? Math.round((resolvedComplaints.length / complaints.length) * 100)
      : 0;

  // Calculate trend (compare with previous period if provided)
  let trendPercent = "+0%";
  let trendLabel = "vs last period";

  if (previousComplaints && previousComplaints.length > 0) {
    const previousRate = Math.round(
      (previousComplaints.filter((c) => c.status === "Resolved").length / previousComplaints.length) * 100
    );
    const diff = resolutionRate - previousRate;
    trendPercent = `${diff >= 0 ? "+" : ""}${diff}%`;
  }

  return {
    totalReports,
    avgResolutionDays: `${avgResolutionDays} days`,
    resolutionRate: `${resolutionRate}%`,
    pendings: complaints.filter((c) => c.status === "Pending").length,
    inProgress: complaints.filter((c) => c.status === "In Progress").length,
    trendPercent,
    trendLabel,
  };
};

// Get date range text
export const getDateRangeText = (dateRange: string): string => {
  switch (dateRange) {
    case "1month":
      return "Last 1 Month";
    case "3months":
      return "Last 3 Months";
    case "1year":
      return "Last 1 Year";
    case "6months":
    default:
      return "Last 6 Months";
  }
};
