import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Notification,
  mockNotifications,
  adminNotifications,
} from "../data/mockData";
import { supabase } from "../../lib/supabase";
import {
  createComplaint as complaintServiceCreate,
  getResidentComplaints,
  getAllComplaints,
  updateComplaintStatus as complaintServiceUpdate,
  deleteComplaint as complaintServiceDelete,
  banResident as banResidentService,
  unbanResident as unbanResidentService,
  getAllResidents as getAllResidentsService,
  CreateComplaintData,
  CreateComplaintResponse,
  GetComplaintsResponse,
  UpdateComplaintResponse,
  DeleteComplaintResponse,
  BanResidentResponse,
  UnbanResidentResponse,
  ComplaintStatus,
  Complaint,
  ResidentData,
  GetResidentsResponse,
} from "../../lib/complaintService";

type UserRole = "resident" | "admin" | null;

interface User {
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  barangay?: string;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  complaints: Complaint[];
  complaintsLoading: boolean;
  residents: ResidentData[];
  residentsLoading: boolean;
  createComplaint: (data: CreateComplaintData) => Promise<CreateComplaintResponse>;
  fetchResidentComplaints: (
    status?: ComplaintStatus,
    category?: string,
    search?: string
  ) => Promise<GetComplaintsResponse>;
  fetchAllComplaints: (
    status?: ComplaintStatus,
    category?: string,
    search?: string
  ) => Promise<GetComplaintsResponse>;
  fetchAllResidents: (search?: string) => Promise<GetResidentsResponse>;
  updateComplaintStatus: (
    complaintId: string,
    status: ComplaintStatus,
    remarks?: string
  ) => Promise<UpdateComplaintResponse>;
  deleteComplaint: (complaintId: string) => Promise<DeleteComplaintResponse>;
  banResident: (residentId: string) => Promise<BanResidentResponse>;
  unbanResident: (residentId: string) => Promise<UnbanResidentResponse>;
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  adminNotifs: Notification[];
  setAdminNotifs: (notifications: Notification[]) => void;
  markNotificationsRead: () => void;
  markAdminNotifsRead: () => void;
  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [residents, setResidents] = useState<ResidentData[]>([]);
  const [residentsLoading, setResidentsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [adminNotifs, setAdminNotifs] = useState<Notification[]>(adminNotifications);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize user from Supabase session on mount
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Check for active Supabase auth session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUserId(session.user.id);
          // Fetch resident data from database
          const { data: resident, error } = await supabase
            .from("residents")
            .select("id, full_name, email, phone_number, address, role")
            .eq("id", session.user.id)
            .single();

          if (!error && resident) {
            setUser({
              name: resident.full_name || "User",
              email: resident.email || "",
              role: (resident.role as "resident" | "admin") || "resident",
              phone: resident.phone_number || undefined,
              address: resident.address || undefined,
            });
          }
        }
      } catch (error) {
        console.error("Failed to initialize user:", error);
      }
    };

    initializeUser();
  }, []);

  // Persist user to sessionStorage when it changes
  useEffect(() => {
    if (user) {
      sessionStorage.setItem("app_user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("app_user");
    }
  }, [user]);

  const markNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAdminNotifsRead = () => {
    setAdminNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Create a new complaint
  const createComplaint = async (
    data: CreateComplaintData
  ): Promise<CreateComplaintResponse> => {
    setComplaintsLoading(true);
    try {
      const response = await complaintServiceCreate(data);
      if (response.success && response.data) {
        // Add new complaint to the local state
        setComplaints((prev) => [response.data!, ...prev]);
      }
      return response;
    } finally {
      setComplaintsLoading(false);
    }
  };

  // Fetch complaints for current resident
  const fetchResidentComplaints = async (
    status?: ComplaintStatus,
    category?: string,
    search?: string
  ): Promise<GetComplaintsResponse> => {
    setComplaintsLoading(true);
    try {
      const response = await getResidentComplaints(
        status,
        category,
        search,
        userId || undefined
      );
      if (response.success && response.data) {
        setComplaints(response.data);
      }
      return response;
    } finally {
      setComplaintsLoading(false);
    }
  };

  // Fetch all complaints (for admins)
  const fetchAllComplaints = async (
    status?: ComplaintStatus,
    category?: string,
    search?: string
  ): Promise<GetComplaintsResponse> => {
    setComplaintsLoading(true);
    try {
      const response = await getAllComplaints(
        status,
        category,
        search,
        user?.role || undefined,
        userId || undefined
      );
      if (response.success && response.data) {
        setComplaints(response.data);
      }
      return response;
    } finally {
      setComplaintsLoading(false);
    }
  };

  // Update complaint status and remarks
  const updateComplaintStatus = async (
    complaintId: string,
    status: ComplaintStatus,
    remarks?: string
  ): Promise<UpdateComplaintResponse> => {
    setComplaintsLoading(true);
    try {
      const response = await complaintServiceUpdate(complaintId, status, remarks);
      if (response.success && response.data) {
        // Update the complaint in local state
        setComplaints((prev) =>
          prev.map((c) => (c.id === complaintId ? response.data! : c))
        );
      }
      return response;
    } finally {
      setComplaintsLoading(false);
    }
  };

  // Delete complaint (admin only)
  const deleteComplaint = async (
    complaintId: string
  ): Promise<DeleteComplaintResponse> => {
    setComplaintsLoading(true);
    try {
      const response = await complaintServiceDelete(complaintId);
      if (response.success) {
        // Remove the complaint from local state
        setComplaints((prev) => prev.filter((c) => c.id !== complaintId));
      }
      return response;
    } finally {
      setComplaintsLoading(false);
    }
  };

  // Ban a resident (admin only)
  const banResident = async (
    residentId: string
  ): Promise<BanResidentResponse> => {
    try {
      const response = await banResidentService(residentId);
      if (response.success) {
        // Remove complaints from this resident from local state
        setComplaints((prev) =>
          prev.filter((c) => c.resident_id !== residentId)
        );
      }
      return response;
    } finally {
      // No need to set loading state as this is independent
    }
  };

  // Unban a resident (admin only)
  const unbanResident = async (
    residentId: string
  ): Promise<UnbanResidentResponse> => {
    try {
      const response = await unbanResidentService(residentId);
      return response;
    } finally {
      // No need to set loading state as this is independent
    }
  };

  // Fetch all residents (for admins)
  const fetchAllResidents = async (
    search?: string
  ): Promise<GetResidentsResponse> => {
    setResidentsLoading(true);
    try {
      const response = await getAllResidentsService(search);
      if (response.success && response.data) {
        setResidents(response.data);
      }
      return response;
    } finally {
      setResidentsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        currentView,
        setCurrentView,
        complaints,
        complaintsLoading,
        residents,
        residentsLoading,
        createComplaint,
        fetchResidentComplaints,
        fetchAllComplaints,
        fetchAllResidents,
        updateComplaintStatus,
        deleteComplaint,
        banResident,
        unbanResident,
        notifications,
        setNotifications,
        adminNotifs,
        setAdminNotifs,
        markNotificationsRead,
        markAdminNotifsRead,
        toastMessage,
        setToastMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
