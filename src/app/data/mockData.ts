export type ComplaintStatus = "Pending" | "In Progress" | "Resolved" | "Rejected";
export type ComplaintCategory =
  | "Road & Infrastructure"
  | "Waste Management"
  | "Public Safety"
  | "Noise Complaint"
  | "Street Lighting"
  | "Water & Drainage"
  | "Public Health"
  | "Other";

export interface Complaint {
  id: string;
  residentName: string;
  residentEmail: string;
  category: ComplaintCategory;
  description: string;
  dateSubmitted: string;
  status: ComplaintStatus;
  remarks?: string;
  imageUrl?: string;
  location?: string;
}

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "update" | "info" | "resolved";
}

export const COMPLAINT_CATEGORIES: ComplaintCategory[] = [
  "Road & Infrastructure",
  "Waste Management",
  "Public Safety",
  "Noise Complaint",
  "Street Lighting",
  "Water & Drainage",
  "Public Health",
  "Other",
];

export const mockComplaints: Complaint[] = [
  {
    id: "SPC-2024-001",
    residentName: "Maria Santos",
    residentEmail: "maria.santos@email.com",
    category: "Road & Infrastructure",
    description:
      "Large pothole on Rizal Avenue near the intersection of Mabini Street. It has caused damage to several vehicles and poses a significant safety hazard especially during rainy season. Immediate repair is needed.",
    dateSubmitted: "2024-03-15",
    status: "In Progress",
    remarks: "Work order issued. Repair team scheduled for next week.",
    location: "Rizal Avenue, Brgy. San Jose",
  },
  {
    id: "SPC-2024-002",
    residentName: "Jose Reyes",
    residentEmail: "jose.reyes@email.com",
    category: "Waste Management",
    description:
      "Illegal dumping of garbage near the creek at Purok 3. Waste has been accumulating for over two weeks and is causing foul odor and attracting pests.",
    dateSubmitted: "2024-03-18",
    status: "Pending",
    location: "Purok 3, near the creek",
  },
  {
    id: "SPC-2024-003",
    residentName: "Ana Cruz",
    residentEmail: "ana.cruz@email.com",
    category: "Street Lighting",
    description:
      "Three consecutive streetlights along Bonifacio Street have been non-functional for the past month. The dark stretch makes the area unsafe at night.",
    dateSubmitted: "2024-03-20",
    status: "Resolved",
    remarks: "Lights repaired and tested. Issue closed.",
    location: "Bonifacio Street, Brgy. Poblacion",
  },
  {
    id: "SPC-2024-004",
    residentName: "Pedro Dela Cruz",
    residentEmail: "pedro.delacruz@email.com",
    category: "Noise Complaint",
    description:
      "Neighbors are conducting construction activities starting at 4 AM, well before the allowed 7 AM start time. This has been ongoing for three weeks.",
    dateSubmitted: "2024-03-22",
    status: "Pending",
    location: "123 Maharlika St., Brgy. Bagong Silang",
  },
  {
    id: "SPC-2024-005",
    residentName: "Elena Gomez",
    residentEmail: "elena.gomez@email.com",
    category: "Water & Drainage",
    description:
      "Clogged drainage canal causing flooding in front of residences every time it rains. The water level reaches ankle-deep and enters some homes.",
    dateSubmitted: "2024-03-25",
    status: "In Progress",
    remarks: "Drainage team dispatched. Desilting operation ongoing.",
    location: "Mabuhay Road, Brgy. Masagana",
  },
  {
    id: "SPC-2024-006",
    residentName: "Roberto Tan",
    residentEmail: "roberto.tan@email.com",
    category: "Public Safety",
    description:
      "Broken guardrail on the bridge at Lakandula Street. Several bolts are missing and the rail is visibly bent. This is extremely dangerous.",
    dateSubmitted: "2024-03-28",
    status: "Pending",
    location: "Lakandula Bridge, Brgy. Riverside",
  },
  {
    id: "SPC-2024-007",
    residentName: "Carmen Villanueva",
    residentEmail: "carmen.v@email.com",
    category: "Public Health",
    description:
      "Open sewage overflow near the public market. The smell is unbearable and health risk is high especially with children playing nearby.",
    dateSubmitted: "2024-04-01",
    status: "Resolved",
    remarks: "Sewage line repaired by Public Works team. Area sanitized.",
    location: "Public Market Area, Brgy. Centro",
  },
  {
    id: "SPC-2024-008",
    residentName: "Miguel Bautista",
    residentEmail: "miguel.b@email.com",
    category: "Road & Infrastructure",
    description:
      "Missing manhole cover on the main road causing accidents. Already three motorcycles have fallen into it. Urgent action required.",
    dateSubmitted: "2024-04-03",
    status: "In Progress",
    remarks: "Temporary barrier placed. Permanent cover on order.",
    location: "Quezon Blvd near Barangay Hall",
  },
];

export const mockResidentComplaints: Complaint[] = [
  {
    id: "SPC-2024-003",
    residentName: "Ana Cruz",
    residentEmail: "ana.cruz@email.com",
    category: "Street Lighting",
    description:
      "Three consecutive streetlights along Bonifacio Street have been non-functional for the past month. The dark stretch makes the area unsafe at night.",
    dateSubmitted: "2024-03-20",
    status: "Resolved",
    remarks: "Lights repaired and tested. Issue closed.",
    location: "Bonifacio Street, Brgy. Poblacion",
  },
  {
    id: "SPC-2024-009",
    residentName: "Ana Cruz",
    residentEmail: "ana.cruz@email.com",
    category: "Water & Drainage",
    description:
      "Flooding issue near our house whenever it rains heavily. Drainage seems blocked.",
    dateSubmitted: "2024-04-02",
    status: "In Progress",
    remarks: "Assigned to engineering team for assessment.",
    location: "24 Pag-asa Street",
  },
  {
    id: "SPC-2024-011",
    residentName: "Ana Cruz",
    residentEmail: "ana.cruz@email.com",
    category: "Noise Complaint",
    description:
      "Bar nearby plays loud music past midnight on weekdays, disturbing the peace.",
    dateSubmitted: "2024-04-05",
    status: "Pending",
    location: "Near Sunset Bar, Brgy. Poblacion",
  },
];

export const mockNotifications: Notification[] = [
  {
    id: "n1",
    message: "Your complaint SPC-2024-009 status updated to 'In Progress'",
    timestamp: "2 hours ago",
    read: false,
    type: "update",
  },
  {
    id: "n2",
    message: "Complaint SPC-2024-003 has been resolved. Please provide feedback.",
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
    message: "New complaint submitted: SPC-2024-011 - Noise Complaint",
    timestamp: "30 min ago",
    read: false,
    type: "info",
  },
  {
    id: "an2",
    message: "Complaint SPC-2024-006 has been pending for 7 days",
    timestamp: "1 hour ago",
    read: false,
    type: "update",
  },
  {
    id: "an3",
    message: "New complaint submitted: SPC-2024-008 - Missing Manhole Cover",
    timestamp: "3 hours ago",
    read: false,
    type: "info",
  },
  {
    id: "an4",
    message: "Complaint SPC-2024-007 marked as Resolved",
    timestamp: "1 day ago",
    read: true,
    type: "resolved",
  },
];
