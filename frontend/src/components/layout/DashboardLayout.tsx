import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useSidebarStore } from '../../store/useSidebarStore';
import { cn } from '../../pustaka/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isSidebarOpen } = useSidebarStore();

    return (
        <div className="flex min-h-screen bg-gray-50/50 font-sans text-gray-900">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <main className={cn(
                "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
                // Adjust margin if sidebar logic changes, but currently sidebar is flex item
            )}>
                <Navbar />

                <div className="flex-1 p-4 md:p-6 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
