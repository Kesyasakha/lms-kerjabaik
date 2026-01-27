import { Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/fitur/autentikasi/stores/authStore";
import { useState } from "react";
import Sidebar from "./Sidebar";
import { cn } from "@/pustaka/utils";

export function MainLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  return (
    <div className={cn(
      "flex flex-col md:flex-row bg-gray-50 dark:bg-neutral-900 w-full min-h-screen",
    )}>
      <Sidebar />

      <div className="flex flex-1 flex-col h-screen overflow-hidden">
        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 space-y-5 overflow-y-auto custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
