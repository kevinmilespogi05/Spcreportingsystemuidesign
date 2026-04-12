import { ComplaintStatus } from "../../data/mockData";

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: "sm" | "md";
}

const statusConfig: Record<ComplaintStatus, { bg: string; text: string; dot: string; label: string }> = {
  Pending: {
    bg: "bg-amber-50 border border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-400",
    label: "Pending",
  },
  "In Progress": {
    bg: "bg-blue-50 border border-blue-200",
    text: "text-blue-700",
    dot: "bg-blue-500",
    label: "In Progress",
  },
  Resolved: {
    bg: "bg-emerald-50 border border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    label: "Resolved",
  },
  Rejected: {
    bg: "bg-red-50 border border-red-200",
    text: "text-red-700",
    dot: "bg-red-500",
    label: "Rejected",
  },
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[status];
  const padding = size === "sm" ? "px-2 py-0.5" : "px-2.5 py-1";
  const dotSize = size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";
  const textSize = size === "sm" ? "text-xs" : "text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${padding} ${config.bg} ${config.text} ${textSize} font-medium`}
    >
      <span className={`${dotSize} rounded-full ${config.dot} flex-shrink-0`} />
      {config.label}
    </span>
  );
}
