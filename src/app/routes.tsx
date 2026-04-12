import { createBrowserRouter, Navigate } from "react-router";
import { AuthPage } from "./components/auth/AuthPage";
import { ResidentLayout } from "./components/resident/ResidentLayout";
import { ResidentDashboard } from "./components/resident/ResidentDashboard";
import { ResidentComplaintsPage } from "./components/resident/ResidentComplaintsPage";
import { ResidentHelpPage } from "./components/resident/ResidentHelpPage";
import { ResidentSettingsPage } from "./components/resident/ResidentSettingsPage";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminOverviewPage } from "./components/admin/AdminOverviewPage";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AdminResidentsPage } from "./components/admin/AdminResidentsPage";
import { AdminCategoriesPage } from "./components/admin/AdminCategoriesPage";
import { AdminAnalyticsPage } from "./components/admin/AdminAnalyticsPage";
import { AdminSettingsPage } from "./components/admin/AdminSettingsPage";

function NotFound() {
  return <Navigate to="/" replace />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AuthPage,
  },
  {
    path: "/resident",
    Component: ResidentLayout,
    children: [
      {
        index: true,
        Component: ResidentDashboard,
      },
      {
        path: "complaints",
        Component: ResidentComplaintsPage,
      },
      {
        path: "help",
        Component: ResidentHelpPage,
      },
      {
        path: "settings",
        Component: ResidentSettingsPage,
      },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      {
        index: true,
        Component: AdminOverviewPage,
      },
      {
        path: "complaints",
        Component: AdminDashboard,
      },
      {
        path: "residents",
        Component: AdminResidentsPage,
      },
      {
        path: "categories",
        Component: AdminCategoriesPage,
      },
      {
        path: "analytics",
        Component: AdminAnalyticsPage,
      },
      {
        path: "settings",
        Component: AdminSettingsPage,
      },
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
