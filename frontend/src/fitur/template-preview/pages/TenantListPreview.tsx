import React from 'react';
import {
    Building,
    SearchNormal1,
    Add,
    Setting4,
    More,
    Eye,
    Edit,
    Trash,
    Profile2User,
    Book,
    Calendar,
    TickCircle,
    CloseCircle
} from 'iconsax-react';
import { cn } from '../../../pustaka/utils';

// Filter Components
const FilterButton = ({ label, active = false }: { label: string, active?: boolean }) => (
    <button className={cn(
        "px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200 border",
        active
            ? "bg-violet-50 text-template-primary border-violet-200"
            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
    )}>
        {label}
    </button>
);

// Table Components
const TenantRow = ({ name, domain, type, status, users, courses, date }: any) => {

    const getTypeColor = (t: string) => {
        switch (t.toLowerCase()) {
            case 'provinsi': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'kampus': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'korporasi': return 'bg-violet-50 text-violet-600 border-violet-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <tr className="group hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0">
            <td className="py-4 pl-6 pr-4 w-[350px]">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:shadow-sm transition-all duration-200 border border-gray-100 group-hover:border-violet-100">
                        <Building size={20} variant="Bold" className="group-hover:text-template-primary transition-colors" />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-800 group-hover:text-template-primary transition-colors cursor-pointer truncate">{name}</p>
                        <p className="text-[10px] text-gray-400 font-medium font-mono truncate">{domain}</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-4 w-[120px]">
                <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border", getTypeColor(type))}>
                    {type}
                </span>
            </td>
            <td className="px-4 py-4 w-[140px]">
                <div className="flex items-center gap-1.5 border rounded-full p-1 pl-1.5 w-fit bg-white">
                    {status === 'Aktif' ? (
                        <TickCircle size={16} variant='Bold' className='text-emerald-500' />
                    ) : (
                        <CloseCircle size={16} variant='Bold' className='text-red-500' />
                    )}
                    <span className="text-xs font-medium text-gray-700 pr-2">{status}</span>
                </div>
            </td>
            <td className="px-2 py-4 text-center w-[80px]">
                <div className="flex flex-col items-center justify-center">
                    <span className="text-xs font-bold text-gray-700">{users}</span>
                    <span className="text-[10px] text-gray-400">Users</span>
                </div>
            </td>
            <td className="px-2 py-4 text-center w-[80px]">
                <div className="flex flex-col items-center justify-center">
                    <span className="text-xs font-bold text-gray-700">{courses}</span>
                    <span className="text-[10px] text-gray-400">Kursus</span>
                </div>
            </td>
            <td className="px-4 py-4 w-[140px]">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar size={14} className="text-gray-400" />
                    {date}
                </div>
            </td>
            <td className="py-4 px-4 text-center w-[120px]">
                <div className="flex justify-center gap-1">
                    <button className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Lihat Detail">
                        <Eye size={18} />
                    </button>
                    <button className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-orange-50 text-gray-400 hover:text-orange-600 transition-colors" title="Edit">
                        <Edit size={18} />
                    </button>
                    <button className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors" title="Hapus">
                        <Trash size={18} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

// Mock Data
const tenants = [
    { id: 1, name: "Pemerintah Provinsi Jawa Timur", domain: "jatimprov.lms.id", type: "Provinsi", status: "Aktif", users: "1,250", courses: "45", date: "12 Jan 2024" },
    { id: 2, name: "Universitas Indonesia", domain: "ui.ac.id", type: "Kampus", status: "Aktif", users: "5,800", courses: "120", date: "10 Feb 2024" },
    { id: 3, name: "PT Telkom Indonesia", domain: "telkom.co.id", type: "Korporasi", status: "Aktif", users: "3,400", courses: "86", date: "15 Mar 2024" },
    { id: 4, name: "BKD DKI Jakarta", domain: "bkd.jakarta.go.id", type: "Provinsi", status: "Non Aktif", users: "0", courses: "5", date: "20 Mar 2024" },
    { id: 5, name: "Institut Teknologi Bandung", domain: "itb.ac.id", type: "Kampus", status: "Aktif", users: "4,200", courses: "95", date: "05 Apr 2024" },
];

export function TenantListPreview() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 mb-1">Manajemen Tenant</h1>
                    <p className="text-gray-500 text-xs">Kelola data organisasi dan lembaga yang terdaftar.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-template-primary rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-violet-200">
                    <Add size={18} />
                    <span>Tambah Tenant</span>
                </button>
            </div>

            {/* Filter & Search */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <FilterButton label="Semua" active />
                    <FilterButton label="Provinsi" />
                    <FilterButton label="Kampus" />
                    <FilterButton label="Korporasi" />
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative group flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder="Cari tenant..."
                            className="pl-10 pr-4 py-2 w-full bg-gray-50 border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-violet-100 focus:bg-white transition-all text-gray-600 placeholder:text-gray-400 focus:outline-none border"
                        />
                        <SearchNormal1 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                    </div>
                    <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 transition-colors">
                        <Setting4 size={18} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border boundary-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="py-4 pl-6 pr-4 text-left text-xs font-semibold text-gray-500 w-[350px]">Organisasi</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 w-[120px]">Tipe</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 w-[140px]">Status</th>
                                <th className="px-2 py-4 text-center text-xs font-semibold text-gray-500 w-[80px]">Pengguna</th>
                                <th className="px-2 py-4 text-center text-xs font-semibold text-gray-500 w-[80px]">Kursus</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 w-[140px]">Terdaftar</th>
                                <th className="py-4 px-4 text-center text-xs font-semibold text-gray-500 w-[120px]">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tenants.map(tenant => (
                                <TenantRow key={tenant.id} {...tenant} />
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50/30">
                    <p className="text-[10px] text-gray-500 font-medium">Menampilkan 1-5 dari 128 data</p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 text-[10px] font-medium border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50" disabled>Sebelumnya</button>
                        <button className="px-3 py-1.5 text-[10px] font-medium border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-700">Selanjutnya</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
