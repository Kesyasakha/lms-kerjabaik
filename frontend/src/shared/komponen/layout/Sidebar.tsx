import { cn, getInitials, getAvatarColor } from "@/pustaka/utils";
import { useSidebar } from "@/komponen/ui/sidebar";
import {
    LayoutDashboard,
    Users,
    BookOpen,
    ClipboardList,
    FileText,
    BarChart3,
    LogOut,
    Building2,
    TrendingUp,
    Shield,
} from "lucide-react";
import { SidebarBody, SidebarLink } from "@/komponen/ui/sidebar";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import logo from "@/assets/logo2.png";

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    roles: string[];
}

// Translated Nav Items based on LMS DESIGN MANIFEST
const navItems: NavItem[] = [
    // === SUPERADMIN ===
    {
        label: "Dasbor",
        href: "/dashboard",
        icon: <LayoutDashboard className="h-5 w-5 flex-shrink-0" />,
        roles: ["superadmin"],
    },
    {
        label: "Tenants",
        href: "/superadmin/tenants",
        icon: <Building2 className="h-5 w-5 flex-shrink-0" />,
        roles: ["superadmin"],
    },
    {
        label: "Pengguna Global",
        href: "/superadmin/users",
        icon: <Users className="h-5 w-5 flex-shrink-0" />,
        roles: ["superadmin"],
    },
    {
        label: "Analitik",
        href: "/superadmin/analytics",
        icon: <TrendingUp className="h-5 w-5 flex-shrink-0" />,
        roles: ["superadmin"],
    },
    {
        label: "Audit Logs",
        href: "/superadmin/audit-logs",
        icon: <Shield className="h-5 w-5 flex-shrink-0" />,
        roles: ["superadmin"],
    },

    // === ADMIN ===
    {
        label: "Dasbor",
        href: "/admin",
        icon: <LayoutDashboard className="h-5 w-5 flex-shrink-0" />,
        roles: ["admin"],
    },
    {
        label: "Manajemen Pengguna",
        href: "/admin/users",
        icon: <Users className="h-5 w-5 flex-shrink-0" />,
        roles: ["admin"],
    },
    {
        label: "Manajemen Kursus",
        href: "/admin/courses",
        icon: <BookOpen className="h-5 w-5 flex-shrink-0" />,
        roles: ["admin"],
    },
    {
        label: "Laporan",
        href: "/admin/reports",
        icon: <BarChart3 className="h-5 w-5 flex-shrink-0" />,
        roles: ["admin"],
    },

    // === INSTRUKTUR ===
    {
        label: "Dasbor",
        href: "/instruktur/dashboard",
        icon: <LayoutDashboard className="h-5 w-5 flex-shrink-0" />,
        roles: ["instruktur"],
    },
    {
        label: "Kursus Saya",
        href: "/instruktur/courses",
        icon: <BookOpen className="h-5 w-5 flex-shrink-0" />,
        roles: ["instruktur"],
    },
    {
        label: "Penilaian",
        href: "/instruktur/assessments",
        icon: <FileText className="h-5 w-5 flex-shrink-0" />,
        roles: ["instruktur"],
    },
    {
        label: "Peserta",
        href: "/instruktur/students",
        icon: <Users className="h-5 w-5 flex-shrink-0" />,
        roles: ["instruktur"],
    },

    // === PEMBELAJAR ===
    {
        label: "Dasbor",
        href: "/pembelajar/dashboard",
        icon: <LayoutDashboard className="h-5 w-5 flex-shrink-0" />,
        roles: ["pembelajar"],
    },
    {
        label: "Kursus",
        href: "/pembelajar/courses",
        icon: <BookOpen className="h-5 w-5 flex-shrink-0" />,
        roles: ["pembelajar"],
    },
    {
        label: "Tugas & Kuis",
        href: "/pembelajar/assignments",
        icon: <ClipboardList className="h-5 w-5 flex-shrink-0" />,
        roles: ["pembelajar"],
    },
];

interface AppSidebarProps {
    open?: boolean;
    setOpen?: (open: boolean) => void;
    user: any;
    handleLogout: () => void;
}

export function AppSidebarContent({ user, handleLogout }: AppSidebarProps) {
    const { open, animate } = useSidebar();

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

    return (
        <SidebarBody className="justify-between gap-10">
            <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Logo />
                <div className="mt-8 flex flex-col gap-2">
                    {filteredNavItems.map((item, idx) => (
                        <SidebarLink key={idx} link={{
                            label: item.label,
                            href: item.href,
                            icon: item.icon
                        }} />
                    ))}
                </div>
            </div>

            {/* User Profile */}
            <div className="mt-auto border-t border-neutral-200 dark:border-neutral-700 pt-4 space-y-2">
                <div className="flex items-center gap-2 py-2">
                    <div
                        className={cn(
                            "h-7 w-7 flex-shrink-0 rounded-full flex items-center justify-center text-[10px] text-white font-bold",
                            user?.nama_lengkap
                                ? getAvatarColor(user.nama_lengkap)
                                : "bg-gray-400"
                        )}
                    >
                        {user?.nama_lengkap ? getInitials(user.nama_lengkap) : "?"}
                    </div>
                    <motion.div
                        animate={{
                            display: animate ? (open ? "flex" : "none") : "flex",
                            opacity: animate ? (open ? 1 : 0) : 1,
                        }}
                        className="flex flex-col overflow-hidden"
                    >
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200 truncate">
                            {user?.nama_lengkap || "User"}
                        </span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                            {user?.role ? getRoleLabel(user.role) : "-"}
                        </span>
                    </motion.div>
                </div>

                <div onClick={handleLogout} className="cursor-pointer">
                    <SidebarLink
                        link={{
                            label: "Keluar",
                            href: "#",
                            icon: <LogOut className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
                        }}
                    />
                </div>
            </div>
        </SidebarBody>
    );
}

export const Logo = () => {
    return (
        <Link
            to="#"
            className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
        >
            <img src={logo} className="h-7 w-auto flex-shrink-0" alt="Logo" />
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium text-black dark:text-white whitespace-pre"
            >
                ACADEMY KERJABAIK.AI
            </motion.span>
        </Link>
    );
};

