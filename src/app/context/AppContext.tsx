import React, { createContext, useContext, useState } from "react";
import {
  Complaint,
  Notification,
  mockComplaints,
  mockResidentComplaints,
  mockNotifications,
  adminNotifications,
} from "../data/mockData";

type UserRole = "resident" | "admin" | null;

interface User {
  name: string;
  email: string;
  role: UserRole;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  complaints: Complaint[];
  setComplaints: (complaints: Complaint[]) => void;
  residentComplaints: Complaint[];
  setResidentComplaints: (complaints: Complaint[]) => void;
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
  const [currentView, setCurrentView] = useState("dashboard");
  const [complaints, setComplaints] = useState<Complaint[]>(mockComplaints);
  const [residentComplaints, setResidentComplaints] = useState<Complaint[]>(mockResidentComplaints);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [adminNotifs, setAdminNotifs] = useState<Notification[]>(adminNotifications);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const markNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAdminNotifsRead = () => {
    setAdminNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        currentView,
        setCurrentView,
        complaints,
        setComplaints,
        residentComplaints,
        setResidentComplaints,
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
