import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Element3,
    Profile2User,
    Setting4,
    Calendar,
    Timer1,
    Folder2,
    Star,
    Document,
    Setting2,
    Headphone,
    Triangle,
    ArrowRight2
} from 'iconsax-react';
import { useSidebarStore } from '../../store/useSidebarStore';
import { cn } from '../../pustaka/utils';

// Placeholder for profile image - using a colored div or similar if image not available
// Or we can simple use a standard placeholder from public or assets if available
// For now, I'll use a simple avatar placeholder

function Sidebar() {
    const location = useLocation();
    const pathname = location.pathname;
    const { isSidebarOpen } = useSidebarStore();

    // Menu logic could be extracted to a config array for cleaner code
    const menuItems = [
        { path: '/dashboard', label: 'Dasbor', icon: Element3, disabled: false },
        { path: '/kursus', label: 'Manajemen Kursus', icon: Folder2, disabled: false }, // Replaces Teams/Projects? adjusted for LMS
        { path: '/siswa', label: 'Data Siswa', icon: Profile2User, disabled: false }, // Replaces Teams
        { path: '/laporan', label: 'Laporan Akademik', icon: Document, disabled: false },
        { path: '/jadwal', label: 'Jadwal', icon: Calendar, disabled: false },
        // { path: '/integrasi', label: 'Integrasi', icon: Setting4, disabled: true },
    ];

    // Bottom menu
    const bottomMenuItems = [
        { path: '/pengaturan', label: 'Pengaturan Sistem', icon: Setting2 },
        { path: '/bantuan', label: 'Bantuan', icon: Headphone },
    ];

    if (!isSidebarOpen) return null; // Or handle collapsed state differently if needed

    return (
        <div className='w-60 shrink-0 hidden md:block h-screen sticky top-0 overflow-hidden border-r bg-white'>
            <div className='w-full h-full flex flex-col justify-between'>
                <div>
                    {/* Logo */}
                    <div className='h-[var(--h-nav)] p-4 md:p-6 flex cursor-pointer group items-center gap-2'>
                        <div className='h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-violet-400 text-white outline outline-violet-300'>
                            <Triangle size={24} className='relative group-hover:scale-75 duration-200' variant="Bold" />
                        </div>
                        <div>
                            <h1 className='text-sm font-bold text-gray-800'>Akademi</h1>
                            <p className='text-xs text-gray-500 font-medium'>KerjaBaik.ai</p>
                        </div>
                    </div>

                    <hr className='bg-gray-200 mx-2' />

                    {/* Menu Items */}
                    <div className='pt-6 flex flex-col gap-1 px-2'>
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.disabled ? '#' : item.path}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 text-xs font-medium",
                                    pathname === item.path
                                        ? "text-template-primary bg-violet-50"
                                        : "text-gray-500 hover:bg-gray-50 hover:px-6",
                                    item.disabled && "opacity-60 cursor-not-allowed hover:bg-transparent hover:px-4"
                                )}
                                onClick={e => item.disabled && e.preventDefault()}
                            >
                                <item.icon size={18} variant={pathname === item.path ? 'Bold' : 'Outline'} />
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>

                <div>
                    <div className='flex flex-col gap-1 px-2 pb-4'>
                        {bottomMenuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 text-xs font-medium",
                                    pathname === item.path
                                        ? "text-template-primary bg-violet-50"
                                        : "text-gray-500 hover:bg-gray-50 hover:px-6"
                                )}
                            >
                                <item.icon size={18} variant={pathname === item.path ? 'Bold' : 'Outline'} />
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    <hr className='bg-gray-200 mx-2 mb-4' />

                    {/* User Profile */}
                    <div className='flex pb-8 px-4 items-center justify-between cursor-pointer group'>
                        <div className='flex items-center gap-2'>
                            <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                                {/* Placeholder for avatar if image not available */}
                                <Profile2User size={20} variant="Bold" />
                            </div>
                            <div className='overflow-hidden'>
                                <p className='text-sm font-semibold text-gray-800 truncate'>Administrator</p>
                                <p className='text-xs font-medium text-gray-500 truncate'>admin@sekolah.id</p>
                            </div>
                        </div>
                        <ArrowRight2 size={16} className="text-gray-400 group-hover:translate-x-1 duration-200" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
