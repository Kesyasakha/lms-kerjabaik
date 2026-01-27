import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { cn } from '../../../pustaka/utils';

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
    // Explicitly mounting font if needed, but it's installed via npm

    return (
        <div className="flex min-h-screen bg-[#FAFBFC] font-sans text-gray-900 selection:bg-violet-100 selection:text-violet-900">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <main className={cn(
                "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out relative",
            )}>
                <Navbar />

                <div className="flex-1 p-4 md:p-8 overflow-auto max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
