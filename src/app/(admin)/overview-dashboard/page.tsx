"use client";

import { ProtectedRoute } from "@/services/protected-route";
import DashboardPage from "../page";

export default function OverviewDashboard() {
    return (
        <ProtectedRoute module="dashboard:overview">
            <DashboardPage />
        </ProtectedRoute>
    );
}
