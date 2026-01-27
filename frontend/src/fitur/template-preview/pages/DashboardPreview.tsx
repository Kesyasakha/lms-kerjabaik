import React from 'react';
import { Book, Profile2User, Teacher, TrendUp, ArrowRight } from 'iconsax-react';

const StatCard = ({ title, value, subtext, icon: Icon, color }: any) => (
    <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] hover:shadow-md transition-shadow duration-200">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-2.5 rounded-xl ${color}`}>
                <Icon size={20} variant="Bold" className="text-white" />
            </div>
            <span className="flex items-center text-[10px] font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <TrendUp size={12} className="mr-1" /> +12.5%
            </span>
        </div>
        <div>
            <p className="text-xs font-medium text-gray-500 mb-0.5">{title}</p>
            <h3 className="text-xl font-bold text-gray-800">{value}</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">{subtext}</p>
        </div>
    </div>
);

const CourseCard = ({ title, instructor, students, category, color }: any) => (
    <div className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-violet-100 hover:shadow-lg hover:shadow-violet-50 transition-all duration-300 cursor-pointer">
        <div className={`h-32 rounded-xl bg-gradient-to-br ${color} mb-4 relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
        </div>
        <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase text-violet-600 bg-violet-50 rounded-full">{category}</span>
            <span className="text-[10px] text-gray-400 font-medium">12 Modul</span>
        </div>
        <h4 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-template-primary transition-colors">{title}</h4>
        <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-slate-200"></div>
                <span>{instructor}</span>
            </div>
            <div className="flex items-center gap-1">
                <Profile2User size={14} variant="Bold" className="text-gray-300" />
                <span>{students} Siswa</span>
            </div>
        </div>
    </div>
);

export function DashboardPreview() {
    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div>
                <h1 className="text-xl font-bold text-gray-800 mb-1">Dasbor Akademik</h1>
                <p className="text-gray-500 text-xs">Overview performa pembelajaran dan statistik sistem.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                    title="Total Siswa"
                    value="2,450"
                    subtext="Siswa aktif bulan ini"
                    icon={Profile2User}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Kursus Aktif"
                    value="45"
                    subtext="12 kursus baru ditambahkan"
                    icon={Book}
                    color="bg-violet-500"
                />
                <StatCard
                    title="Total Instruktur"
                    value="86"
                    subtext="3 instruktur baru"
                    icon={Teacher}
                    color="bg-orange-500"
                />
                <StatCard
                    title="Sertifikat"
                    value="1,205"
                    subtext="Diterbitkan tahun ini"
                    icon={TrendUp} // Placeholder icon
                    color="bg-emerald-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Content Section - Main */}
                <div className="lg:col-span-2 space-y-5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-gray-800">Kursus Populer</h2>
                        <button className="text-xs font-semibold text-template-primary hover:text-violet-700 flex items-center gap-1">
                            Lihat Semua <ArrowRight size={14} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CourseCard
                            title="UI/UX Design Masterclass untuk Pemula"
                            instructor="Budi Santoso"
                            students="1,240"
                            category="Desain"
                            color="from-pink-400 to-rose-400"
                        />
                        <CourseCard
                            title="Fullstack Web Development dengan React & Node.js"
                            instructor="Siti Aminah"
                            students="890"
                            category="Programming"
                            color="from-cyan-400 to-blue-400"
                        />
                    </div>
                </div>

                {/* Sidebar Section - Right */}
                <div className="space-y-5">
                    <h2 className="text-base font-bold text-gray-800">Aktivitas Terbaru</h2>
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <div className="space-y-5">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className="h-1.5 w-1.5 rounded-full bg-violet-400 ring-2 ring-violet-50"></div>
                                        <div className="w-px h-full bg-gray-100 my-1"></div>
                                    </div>
                                    <div className="pb-2">
                                        <p className="text-[10px] text-gray-400 font-medium mb-0.5">Baru saja</p>
                                        <p className="text-xs font-medium text-gray-800">Ahmad menyelesaikan kuis "Basic figma"</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">Nilai: 85/100</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
