import React from 'react';
import { useSidebarStore } from '../../../store/useSidebarStore';
import {
    SearchNormal1,
    DirectNotification,
    CalendarEdit,
    Add,
    HambergerMenu,
    Profile2User
} from 'iconsax-react';

export default function Navbar() {
    const { isSidebarOpen, toggleSidebar } = useSidebarStore();

    return (
        <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 w-full border-b border-gray-200">
            <div className='flex p-4 md:p-6 justify-between items-center'>

                {/* Mobile Sidebar Toggle & Left Section */}
                <div className='flex items-center gap-4'>
                    <button
                        onClick={toggleSidebar}
                        className='flex md:hidden items-center justify-center p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors'
                    >
                        <HambergerMenu size={20} />
                    </button>

                    <div className='flex items-center gap-2'>
                        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 overflow-hidden">
                            <Profile2User size={24} variant="Bold" />
                        </div>
                        <div>
                            <p className='text-sm font-bold text-gray-800'>Administrator</p>
                            <p className='text-xs font-medium text-gray-500'>Selamat datang kembali</p>
                        </div>
                    </div>
                </div>

                {/* Right Section */}
                <div className='flex items-center gap-2 text-gray-500'>
                    <button className='flex items-center justify-center h-8 w-8 hover:bg-gray-100 rounded-lg transition-colors'>
                        <SearchNormal1 size={16} />
                    </button>

                    <button className='flex items-center justify-center h-8 w-8 hover:bg-gray-100 hover:text-violet-600 rounded-lg transition-colors relative'>
                        <DirectNotification size={16} />
                        <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-white ring-1 ring-white"></span>
                    </button>

                    <button className='hidden md:flex items-center gap-1 px-2 py-1 h-8 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-all border border-transparent hover:border-gray-200'>
                        <CalendarEdit size={16} />
                        <span>Jadwal</span>
                    </button>

                    <button className='flex items-center gap-1 px-2 py-1 h-8 text-xs font-semibold text-white bg-template-primary rounded-lg hover:brightness-110 active:scale-95 transition-all'>
                        <Add size={16} />
                        <span className='hidden md:inline'>Buat Baru</span>
                    </button>
                </div>
            </div>
            {/* Template has an hr here optionally, but often border-b is enough. Template has hr inside navbar div. */}
            <hr className='bg-gray-200 mx-2' />
        </div>
    );
}
