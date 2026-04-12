export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "update" | "info" | "resolved";
}

export const mockNotifications: Notification[] = [
  {
    id: "n1",
    message: "Your complaint SPC-2024-001 status updated to 'In Progress'",
    timestamp: "2 hours ago",
    read: false,
    type: "update",
  },
  {
    id: "n2",
    message: "Complaint SPC-2024-002 has been resolved. Please provide feedback.",
    timestamp: "1 day ago",
    read: false,
    type: "resolved",
  },
  {
    id: "n3",
    message: "Your complaint SPC-2024-003 has been received and is under review.",
    timestamp: "2 weeks ago",
    read: true,
    type: "info",
  },
];

export const adminNotifications: Notification[] = [
  {
    id: "an1",
    message: "New complaint submitted: SPC-2024-001 - Road & Infrastructure",
    timestamp: "30 min ago",
    read: false,
    type: "info",
  },
  {
    id: "an2",
    message: "Complaint SPC-2024-002 has been pending for 7 days",
    timestamp: "1 hour ago",
    read: false,
    type: "update",
  },
  {
    id: "an3",
    message: "New complaint submitted: SPC-2024-003 - Waste Management",
    timestamp: "3 hours ago",
    read: false,
    type: "info",
  },
  {
    id: "an4",
    message: "Complaint SPC-2024-004 marked as Resolved",
    timestamp: "1 day ago",
    read: true,
    type: "resolved",
  },
];
