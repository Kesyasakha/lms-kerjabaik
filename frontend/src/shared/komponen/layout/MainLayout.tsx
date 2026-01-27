import { Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/fitur/autentikasi/stores/authStore";
import { useEffect, useState } from "react";
import { AppSidebarContent } from "./Sidebar";
import { Sidebar } from "@/komponen/ui/sidebar";
import { cn } from "@/pustaka/utils";

export function MainLayout() {
  const { user, logout, initialize, isInitialized } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className={cn(
      "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
      "h-screen"
    )}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <AppSidebarContent user={user} handleLogout={handleLogout} />
      </Sidebar>

      <div className="flex flex-1 flex-col h-full overflow-y-auto">


        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 space-y-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
