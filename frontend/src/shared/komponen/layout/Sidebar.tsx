import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Element3,
    Profile2User,
    Calendar,
    Document,
    Setting2,
    Headphone,
    Triangle,
    ArrowRight2,
    Book,
    Teacher,
    Building,
    SidebarLeft,
    SidebarRight,
    ShieldSecurity,
    ChartSquare,
    Note,
    ClipboardText,
    LogoutCurve
} from 'iconsax-react';
import { useSidebarStore } from '@/store/useSidebarStore';
import { cn, getInitials, getAvatarColor } from '@/pustaka/utils';
import { useAuthStore } from '@/fitur/autentikasi/stores/authStore';
import logo2 from '@/assets/logo2.png';

export default function Sidebar() {
    const location = useLocation();
    const pathname = location.pathname;
    const { isCollapsed, toggleCollapse } = useSidebarStore();
    const { user, logout } = useAuthStore();

    interface NavItem {
        label: string;
        href: string;
        icon: any;
        roles: string[];
    }

    const navItems: NavItem[] = [
        // === SUPERADMIN ===
        { label: "Dasbor", href: "/superadmin", icon: Element3, roles: ["superadmin"] },
        { label: "Tenants", href: "/superadmin/tenants", icon: Building, roles: ["superadmin"] },
        { label: "Pengguna Global", href: "/superadmin/users", icon: Profile2User, roles: ["superadmin"] },
        { label: "Analitik", href: "/superadmin/analytics", icon: ChartSquare, roles: ["superadmin"] },
        { label: "Audit Logs", href: "/superadmin/audit-logs", icon: ShieldSecurity, roles: ["superadmin"] },

        // === ADMIN ===
        { label: "Dasbor", href: "/admin", icon: Element3, roles: ["admin"] },
        { label: "Manajemen Pengguna", href: "/admin/users", icon: Profile2User, roles: ["admin"] },
        { label: "Manajemen Kursus", href: "/admin/courses", icon: Book, roles: ["admin"] },
        { label: "Laporan", href: "/admin/reports", icon: Document, roles: ["admin"] },

        // === INSTRUKTUR ===
        { label: "Dasbor", href: "/instruktur/dashboard", icon: Element3, roles: ["instruktur"] },
        { label: "Kursus Saya", href: "/instruktur/courses", icon: Book, roles: ["instruktur"] },
        { label: "Penilaian", href: "/instruktur/assessments", icon: Note, roles: ["instruktur"] },
        { label: "Peserta", href: "/instruktur/students", icon: Profile2User, roles: ["instruktur"] },

        // === PEMBELAJAR ===
        { label: "Dasbor", href: "/pembelajar/dashboard", icon: Element3, roles: ["pembelajar"] },
        { label: "Kursus", href: "/pembelajar/courses", icon: Book, roles: ["pembelajar"] },
        { label: "Tugas & Kuis", href: "/pembelajar/assignments", icon: ClipboardText, roles: ["pembelajar"] },
    ];

    const filteredNavItems = navItems.filter((item) =>
        user?.role ? item.roles.includes(user.role) : false
    );

    const getRoleLabel = (role: string) => {
        const roles: Record<string, string> = {
            superadmin: "Superadmin",
            admin: "Admin",
            instruktur: "Instruktur",
            pembelajar: "Pembelajar",
        };
        return roles[role] || role;
    };

    const sidebarVariants = {
        expanded: { width: "220px" },
        collapsed: { width: "60px" }
    };

    return (
        <motion.div
            variants={sidebarVariants}
            initial={isCollapsed ? "collapsed" : "expanded"}
            animate={isCollapsed ? "collapsed" : "expanded"}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="shrink-0 hidden md:block h-screen sticky top-0 border-r border-border bg-white z-40 relative"
        >
            {/* Toggle Button */}
            <div className="absolute -right-3 top-[52px] z-50">
                <button
                    onClick={toggleCollapse}
                    className="bg-white border border-gray-200 rounded-full p-1.5 text-gray-500 hover:text-template-primary hover:border-violet-200 shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95"
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? <SidebarRight size={16} variant="Bold" /> : <SidebarLeft size={16} variant="Bold" />}
                </button>
            </div>

            <div className="w-full h-full flex flex-col justify-between overflow-x-hidden overflow-y-auto custom-scrollbar bg-white">
                <div>
                    {/* Logo - Compact 60px Width */}
                    <div className="flex items-center h-[60px]"> {/* Reduced height */}
                        <div className="w-[60px] shrink-0 flex items-center justify-center">
                            <img
                                src={logo2}
                                alt="Akademi Logo"
                                className="h-9 w-9 object-contain hover:scale-110 transition-transform duration-200"
                            />
                        </div>

                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.3, delay: 0.1 }}
                                    className="whitespace-nowrap overflow-hidden"
                                >
                                    <h1 className='text-sm font-bold text-gray-800 tracking-wide'>Akademi</h1>
                                    <p className='text-[10px] text-gray-500 font-medium tracking-wider uppercase'>LMS System</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="mx-4 my-1">
                        <hr className='bg-gray-100' />
                    </div>

                    {/* Menu Items - Compact Spacing */}
                    <div className='pt-3 flex flex-col gap-0.5 px-0'>
                        {filteredNavItems.map((item, idx) => (
                            <Link
                                key={idx}
                                to={item.href}
                                className={cn(
                                    "flex items-center h-9 w-full relative group transition-all duration-200",
                                    // Hover effect: Only shifts right when NOT active and NOT collapsed
                                    !isCollapsed && (pathname !== item.href) && "hover:pl-2",
                                    // Active state: No bg, just text color
                                    pathname === item.href ? "text-template-primary" : "text-gray-500 hover:text-gray-900"
                                )}
                                title={isCollapsed ? item.label : ""}
                            >
                                {/* Icon Container - FIXED WIDTH (60px) for compact stability */}
                                <div className="w-[60px] shrink-0 flex items-center justify-center">
                                    <item.icon
                                        size={18} // Smaller icon
                                        variant={pathname === item.href ? 'Bold' : 'Linear'}
                                        className={cn(
                                            "transition-colors duration-200",
                                            pathname === item.href ? "text-template-primary" : "text-gray-400 group-hover:text-gray-600"
                                        )}
                                    />
                                </div>

                                <AnimatePresence>
                                    {!isCollapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.3 }}
                                            className={cn(
                                                "whitespace-nowrap overflow-hidden text-xs font-medium pr-4", // Smaller text
                                                pathname === item.href ? "text-template-primary font-semibold" : "text-gray-600 group-hover:text-gray-900"
                                            )}
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-1 pb-4">
                    {/* User Profile */}
                    <div className={cn(
                        'flex items-center w-full cursor-pointer group hover:bg-gray-50 py-1.5',
                    )}>
                        <div className="w-[60px] shrink-0 flex items-center justify-center">
                            <div className={cn(
                                "h-9 w-9 rounded-full flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-white shadow-sm z-10 transition-transform duration-200 group-hover:scale-105",
                                user?.nama_lengkap ? getAvatarColor(user.nama_lengkap) : "bg-gray-400"
                            )}>
                                {user?.nama_lengkap ? getInitials(user.nama_lengkap) : "?"}
                            </div>
                        </div>

                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex flex-col justify-center overflow-hidden whitespace-nowrap pr-4"
                                >
                                    <p className='text-xs font-bold text-gray-800 truncate'>{user?.nama_lengkap || "User"}</p>
                                    <p className='text-[9px] font-medium text-gray-400 truncate'>{user?.role ? getRoleLabel(user.role) : "-"}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="mx-4">
                        <hr className='bg-gray-100' />
                    </div>

                    {/* Logout Button */}
                    <div className=''>
                        <button
                            onClick={logout}
                            className={cn(
                                "w-full flex items-center h-9 w-full relative group transition-all duration-200",
                                // Hover effect for logout
                                !isCollapsed && "hover:pl-2"
                            )}
                            title={isCollapsed ? "Keluar" : ""}
                        >
                            <div className="w-[60px] shrink-0 flex items-center justify-center">
                                <LogoutCurve
                                    size={18}
                                    variant="Bulk"
                                    className="text-gray-400 group-hover:text-red-500 transition-colors duration-200"
                                />
                            </div>

                            <AnimatePresence>
                                {!isCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.3 }}
                                        className="whitespace-nowrap overflow-hidden text-xs font-medium text-gray-500 group-hover:text-red-500"
                                    >
                                        Keluar
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
