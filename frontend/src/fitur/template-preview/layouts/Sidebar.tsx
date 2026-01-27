import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Element3,
    Profile2User,
    Calendar,
    Folder2,
    Document,
    Setting2,
    Headphone,
    Triangle,
    ArrowRight2,
    Book,
    Teacher,
    Building,
    SidebarLeft,
    SidebarRight
} from 'iconsax-react';
import { useSidebarStore } from '../../../store/useSidebarStore';
import { cn } from '../../../pustaka/utils';

export default function Sidebar() {
    const location = useLocation();
    const pathname = location.pathname;
    const { isSidebarOpen, isCollapsed, toggleCollapse } = useSidebarStore();

    // Updated LMS Menu Items
    const menuItems = [
        { path: '/template-preview/superadmin', label: 'Dasbor', icon: Element3, disabled: false },
        { path: '/template-preview/tenants', label: 'Manajemen Tenant', icon: Building, disabled: false },
        { path: '/template-preview/courses', label: 'Manajemen Kursus', icon: Book, disabled: false },
        { path: '/template-preview/students', label: 'Data Siswa', icon: Profile2User, disabled: false },
        { path: '/template-preview/instructors', label: 'Instruktur', icon: Teacher, disabled: false },
        { path: '/template-preview/reports', label: 'Laporan Akademik', icon: Document, disabled: false },
        { path: '/template-preview/schedule', label: 'Jadwal', icon: Calendar, disabled: false },
    ];

    // Bottom menu
    const bottomMenuItems = [
        { path: '/template-preview/settings', label: 'Pengaturan Sistem', icon: Setting2 },
        { path: '/template-preview/help', label: 'Bantuan', icon: Headphone },
    ];

    if (!isSidebarOpen) return null;

    return (
        <div
            className={cn(
                "shrink-0 hidden md:block h-screen sticky top-0 border-r border-border bg-white z-40",
                // Base transition for width
                "transition-[width] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            {/* Toggle Button - Outside Overflow Area */}
            {/* Positioned relative to the sidebar container, but visible because wrapper is not overflow-hidden */}
            <div className="absolute -right-3 top-9 z-50">
                <button
                    onClick={toggleCollapse}
                    className="bg-white border border-gray-200 rounded-full p-1.5 text-gray-500 hover:text-template-primary hover:border-violet-200 shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95"
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? <SidebarRight size={14} variant="Bold" /> : <SidebarLeft size={14} variant="Bold" />}
                </button>
            </div>

            {/* Inner Content Wrapper - Handles Overflow */}
            {/* This inner div ensures content stays cleanly clipped or scrolled */}
            <div className="w-full h-full flex flex-col justify-between overflow-x-hidden overflow-y-auto custom-scrollbar bg-white">
                <div>
                    {/* Logo */}
                    <div className={cn(
                        'h-[var(--h-nav)] flex items-center gap-3 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]',
                        isCollapsed ? 'justify-center px-0' : 'px-6'
                    )}>
                        <div className='h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-violet-400 text-white outline outline-violet-300 shadow-lg shadow-violet-200/50 z-10'>
                            <Triangle size={24} className='relative group-hover:scale-75 duration-200' variant="Bold" />
                        </div>

                        <div className={cn(
                            "flex flex-col justify-center overflow-hidden whitespace-nowrap",
                            // Text transition: fast out, slow in
                            "transition-[opacity,transform,width] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                            isCollapsed
                                ? "opacity-0 w-0 -translate-x-4 pointer-events-none"
                                : "opacity-100 w-32 translate-x-0 delay-75"
                        )}>
                            <h1 className='text-sm font-bold text-gray-800 tracking-wide'>Akademi</h1>
                            <p className='text-[10px] text-gray-500 font-medium tracking-wider uppercase'>LMS System</p>
                        </div>
                    </div>

                    <div className="mx-4 transition-all duration-500">
                        <hr className='bg-gray-100' />
                    </div>

                    {/* Menu Items */}
                    <div className='pt-6 flex flex-col gap-1 px-3'>
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.disabled ? '#' : item.path}
                                className={cn(
                                    "flex items-center gap-3 py-2.5 rounded-xl transition-all duration-200 text-xs font-medium group relative overflow-hidden",
                                    pathname === item.path
                                        ? "text-template-primary"
                                        : "text-gray-500 hover:text-gray-900",

                                    // Spacing & Hover
                                    !isCollapsed ? "px-4" : "justify-center px-0",
                                    !isCollapsed && (pathname !== item.path) && "hover:px-6 hover:bg-gray-50", // Original hover effect when expanded

                                    item.disabled && "opacity-60 cursor-not-allowed"
                                )}
                                title={isCollapsed ? item.label : ""}
                                onClick={e => item.disabled && e.preventDefault()}
                            >
                                <div className="shrink-0 z-10">
                                    <item.icon
                                        size={18}
                                        variant={pathname === item.path ? 'Bold' : 'Linear'}
                                        className={cn(
                                            "transition-colors duration-200",
                                        )}
                                    />
                                </div>

                                <span className={cn(
                                    "whitespace-nowrap overflow-hidden",
                                    // Text transition: fast out (0ms), slow in (delay)
                                    "transition-[opacity,transform,max-width] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                                    isCollapsed
                                        ? "opacity-0 max-w-0 -translate-x-4 pointer-events-none"
                                        : "opacity-100 max-w-[150px] translate-x-0 delay-100" // Delayed fade-in prevents overlap
                                )}>
                                    {item.label}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                <div>
                    <div className='flex flex-col gap-1 px-3 pb-4'>
                        {bottomMenuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 py-2.5 rounded-xl transition-all duration-200 text-xs font-medium group relative overflow-hidden",
                                    pathname === item.path
                                        ? "text-template-primary"
                                        : "text-gray-500 hover:text-gray-900",

                                    !isCollapsed ? "px-4" : "justify-center px-0",
                                    !isCollapsed && (pathname !== item.path) && "hover:px-6 hover:bg-gray-50"
                                )}
                                title={isCollapsed ? item.label : ""}
                            >
                                <div className="shrink-0 z-10">
                                    <item.icon
                                        size={18}
                                        variant={pathname === item.path ? 'Bold' : 'Linear'}
                                        className={cn(
                                            "transition-colors duration-200",
                                        )}
                                    />
                                </div>
                                <span className={cn(
                                    "whitespace-nowrap overflow-hidden",
                                    "transition-[opacity,transform,max-width] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                                    isCollapsed
                                        ? "opacity-0 max-w-0 -translate-x-4 pointer-events-none"
                                        : "opacity-100 max-w-[150px] translate-x-0 delay-100"
                                )}>
                                    {item.label}
                                </span>
                            </Link>
                        ))}
                    </div>

                    <div className="mx-4 mb-4">
                        <hr className='bg-gray-100' />
                    </div>

                    {/* User Profile */}
                    <div className={cn(
                        'flex pb-8 items-center cursor-pointer group mx-2 rounded-xl transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]',
                        isCollapsed ? 'justify-center p-0' : 'justify-between px-2 hover:bg-gray-50'
                    )}>
                        <div className='flex items-center gap-3 overflow-hidden'>
                            <div className="h-9 w-9 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 overflow-hidden ring-2 ring-white shadow-sm z-10">
                                <Profile2User size={18} variant="Bold" />
                            </div>
                            <div className={cn(
                                'flex flex-col justify-center overflow-hidden whitespace-nowrap',
                                "transition-[opacity,transform,max-width] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                                isCollapsed
                                    ? "opacity-0 max-w-0 -translate-x-4 pointer-events-none"
                                    : "opacity-100 max-w-[120px] translate-x-0 delay-100"
                            )}>
                                <p className='text-sm font-bold text-gray-800 truncate'>Admin</p>
                                <p className='text-[10px] font-medium text-gray-400 truncate'>System</p>
                            </div>
                        </div>
                        <div className={cn(
                            "transition-[opacity,transform,max-width] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                            isCollapsed
                                ? "opacity-0 max-w-0 pointer-events-none"
                                : "opacity-100 max-w-[20px] delay-100"
                        )}>
                            <ArrowRight2 size={14} className="text-gray-400 group-hover:text-template-primary group-hover:translate-x-1 duration-200" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
