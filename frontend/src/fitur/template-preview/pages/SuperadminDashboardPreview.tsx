import React from 'react';
import {
    Building,
    Profile2User,
    Book1,
    Teacher,
    TrendUp,
    More,
    ArrowRight2,
    Chart
} from 'iconsax-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const StatCard = ({ title, value, subtext, icon: Icon, color, percent }: any) => (
    <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] hover:shadow-md transition-shadow duration-200">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-2.5 rounded-xl ${color}`}>
                <Icon size={20} variant="Bold" className="text-white" />
            </div>
            <span className="flex items-center text-[10px] font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <TrendUp size={12} className="mr-1" /> {percent}
            </span>
        </div>
        <div>
            <p className="text-xs font-medium text-gray-500 mb-0.5">{title}</p>
            <h3 className="text-xl font-bold text-gray-800">{value}</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">{subtext}</p>
        </div>
    </div>
);

const ActivityItem = ({ title, time, user, score }: any) => (
    <div className="flex gap-4 items-start p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-default">
        <div className="flex flex-col items-center mt-1">
            <div className="h-2 w-2 rounded-full bg-violet-400 ring-4 ring-violet-50"></div>
            <div className="w-px h-8 bg-gray-100 mt-1"></div>
        </div>
        <div className="flex-1">
            <div className="flex justify-between items-start">
                <p className="text-xs font-semibold text-gray-800">{user}</p>
                <span className="text-[10px] text-gray-400">{time}</span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">{title}</p>
            {score && (
                <span className="inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 bg-violet-50 text-violet-600 rounded-md">
                    Nilai: {score}
                </span>
            )}
        </div>
    </div>
);

// Dummy Data
const tenantGrowthData = [
    { month: "Jan", tenants: 12 },
    { month: "Feb", tenants: 18 },
    { month: "Mar", tenants: 25 },
    { month: "Apr", tenants: 32 },
    { month: "Mei", tenants: 42 },
    { month: "Jun", tenants: 48 },
    { month: "Jul", tenants: 55 },
    { month: "Agt", tenants: 62 },
    { month: "Sep", tenants: 71 },
    { month: "Okt", tenants: 78 },
    { month: "Nov", tenants: 85 },
    { month: "Des", tenants: 92 },
];

export function SuperadminDashboardPreview() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-gray-800 mb-1">Dasbor Superadmin</h1>
                <p className="text-gray-500 text-xs">Ringkasan statistik global platform LMS.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                    title="Total Tenant"
                    value="92"
                    subtext="85 tenant aktif"
                    icon={Building}
                    color="bg-blue-500"
                    percent="+12%"
                />
                <StatCard
                    title="Total Pengguna"
                    value="2,847"
                    subtext="312 aktif hari ini"
                    icon={Profile2User}
                    color="bg-violet-500"
                    percent="+24%"
                />
                <StatCard
                    title="Total Kursus"
                    value="156"
                    subtext="Tersedia di platform"
                    icon={Book1}
                    color="bg-orange-500"
                    percent="+8%"
                />
                <StatCard
                    title="Total Instruktur"
                    value="142"
                    subtext="Terverifikasi"
                    icon={Teacher}
                    color="bg-emerald-500"
                    percent="+5%"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart Section */}
                <div className="lg:col-span-2 space-y-5">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-base font-bold text-gray-800">Pertumbuhan Tenant</h3>
                                <p className="text-xs text-gray-500">Statistik pendaftaran tenant baru tahun ini</p>
                            </div>
                            <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                                <More size={18} />
                            </button>
                        </div>

                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={tenantGrowthData}>
                                    <defs>
                                        <linearGradient id="colorTenants" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#7B6CF0" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#7B6CF0" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#9CA3AF", fontSize: 10 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#9CA3AF", fontSize: 10 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1F2937',
                                            borderRadius: '8px',
                                            border: 'none',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                            color: '#F9FAFB',
                                            fontSize: '12px'
                                        }}
                                        itemStyle={{ color: '#F9FAFB' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="tenants"
                                        stroke="#7B6CF0"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorTenants)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Storage Usage Placeholder */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-bold text-gray-800">Penggunaan Storage</h3>
                                <Chart size={18} className="text-gray-400" />
                            </div>
                            <div className="space-y-4">
                                {[
                                    { name: "Provinsi Jatim", usage: 75, color: "bg-blue-500" },
                                    { name: "BKD DKI", usage: 62, color: "bg-emerald-500" },
                                    { name: "Kampus ITB", usage: 88, color: "bg-orange-500" },
                                    { name: "Korporasi ABC", usage: 45, color: "bg-violet-500" },
                                ].map((item, idx) => (
                                    <div key={idx} className="space-y-1.5">
                                        <div className="flex justify-between text-xs">
                                            <span className="font-medium text-gray-700">{item.name}</span>
                                            <span className="font-bold text-gray-900">{item.usage}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.usage}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Activity */}
                <div className="space-y-5">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm h-full">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-bold text-gray-800">Aktivitas Terkini</h3>
                            <button className="text-xs font-semibold text-template-primary hover:text-violet-700 flex items-center gap-1">
                                Lihat Semua <ArrowRight2 size={14} />
                            </button>
                        </div>
                        <div className="space-y-2">
                            <ActivityItem
                                user="Budi Santoso"
                                time="2 menit lalu"
                                title="Mendaftar tenant baru 'PT Teknologi Maju'"
                            />
                            <ActivityItem
                                user="Siti Aminah"
                                time="15 menit lalu"
                                title="Menyelesaikan kuis 'Basic React Hooks'"
                                score="90/100"
                            />
                            <ActivityItem
                                user="Admin Jatim"
                                time="1 jam lalu"
                                title="Memperbarui konten kursus 'Laravel 10'"
                            />
                            <ActivityItem
                                user="Rudi Hermawan"
                                time="3 jam lalu"
                                title="Login ke sistem dari IP baru"
                            />
                            <ActivityItem
                                user="System"
                                time="5 jam lalu"
                                title="Backup database otomatis berhasil"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
