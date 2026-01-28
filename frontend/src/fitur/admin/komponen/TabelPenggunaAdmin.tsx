import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/komponen/ui/table";
import { Switch } from "@/komponen/ui/switch";
import {
  Edit,
  Trash,
  Profile2User,
  TickCircle,
  CloseCircle
} from "iconsax-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/komponen/ui/alert-dialog";
import type { Database } from "@/shared/tipe/database.types";
import { cn } from "@/pustaka/utils";

type Pengguna = Database["public"]["Tables"]["pengguna"]["Row"];

const roleInfo = {
  superadmin: { label: "Superadmin", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-100" },
  admin: { label: "Admin", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-100" },
  instruktur: { label: "Instruktur", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-100" },
  pembelajar: { label: "Pembelajar", color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-100" },
};

interface TabelPenggunaAdminProps {
  users: Pengguna[];
  isLoading?: boolean;
  onEdit: (user: Pengguna) => void;
  onDelete: (user: Pengguna) => void;
  onToggleStatus: (userId: string, currentStatus: string) => void;
}

export function TabelPenggunaAdmin({
  users,
  isLoading,
  onEdit,
  onDelete,
  onToggleStatus,
}: TabelPenggunaAdminProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Pengguna | null>(null);

  const confirmDelete = (user: Pengguna) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (userToDelete) {
      onDelete(userToDelete);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-300 rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-100">
              <TableHead className="py-4 px-6 text-left text-xs font-semibold text-gray-500">Pengguna</TableHead>
              <TableHead className="py-4 text-left text-xs font-semibold text-gray-500">Role</TableHead>
              <TableHead className="py-4 text-left text-xs font-semibold text-gray-500">Status Akun</TableHead>
              <TableHead className="py-4 text-center text-xs font-semibold text-gray-500 w-[180px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i} className="border-b border-gray-50">
                <TableCell className="px-6 py-4"><div className="h-10 bg-gray-50 animate-pulse rounded-xl w-48" /></TableCell>
                <TableCell className="py-4"><div className="h-6 bg-gray-50 animate-pulse rounded-lg w-32" /></TableCell>
                <TableCell className="py-4"><div className="h-6 bg-gray-50 animate-pulse rounded-lg w-20" /></TableCell>
                <TableCell className="py-4"><div className="h-8 bg-gray-50 animate-pulse rounded-xl w-24 mx-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white border border-gray-300 rounded-xl shadow-sm overflow-hidden p-20 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
            <Profile2User size={32} />
          </div>
          <div>
            <p className="text-gray-800 font-bold text-sm">Data Tidak Ditemukan</p>
            <p className="text-gray-400 text-xs mt-1">Gunakan kata kunci atau filter lain.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-300 rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-100">
              <TableHead className="py-4 px-6 text-left text-xs font-semibold text-gray-500">Pengguna</TableHead>
              <TableHead className="py-4 text-left text-xs font-semibold text-gray-500">Role</TableHead>
              <TableHead className="py-4 text-left text-xs font-semibold text-gray-500">Status Akun</TableHead>
              <TableHead className="py-4 text-center text-xs font-semibold text-gray-500 w-[180px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const rInfo = roleInfo[user.role as keyof typeof roleInfo] || roleInfo.pembelajar;

              return (
                <TableRow key={user.id} className="group hover:bg-gray-50/50 border-b border-gray-100 last:border-0 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:shadow-sm transition-all duration-200 border border-gray-100 group-hover:border-violet-100 font-bold text-sm shrink-0 uppercase">
                        {user.nama_lengkap.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-gray-800 group-hover:text-[#7B6CF0] transition-colors">
                          {user.nama_lengkap}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium font-mono">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className={cn("inline-flex items-center px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider bg-white shadow-sm shrink-0", rInfo.color, rInfo.border)}>
                      {rInfo.label}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 border rounded-full p-1 pl-1.5 w-fit bg-white border-gray-100">
                        {user.status === 'aktif' ? (
                          <TickCircle size={16} variant='Bold' className='text-emerald-500' />
                        ) : (
                          <CloseCircle size={16} variant='Bold' className={user.status === 'suspended' ? 'text-red-500' : 'text-gray-400'} />
                        )}
                        <span className={cn(
                          "text-xs font-medium pr-2 capitalize",
                          user.status === 'aktif' ? "text-emerald-700" :
                            user.status === 'suspended' ? "text-red-700" : "text-gray-700"
                        )}>
                          {user.status === 'suspended' ? 'Ditangguhkan' : user.status === 'nonaktif' ? 'Non-Aktif' : 'Aktif'}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="flex items-center mr-2 relative group-switch" title={user.status === "aktif" ? "Nonaktifkan pengguna" : "Aktifkan pengguna"}>
                        <Switch
                          checked={user.status === "aktif"}
                          onCheckedChange={() => onToggleStatus(user.id, user.status)}
                          disabled={user.role === "admin" || user.status === "suspended"}
                          className="data-[state=checked]:bg-emerald-500 scale-75"
                        />
                      </div>
                      <button
                        onClick={() => onEdit(user)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-orange-50 text-gray-400 hover:text-orange-600 transition-all"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => confirmDelete(user)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                        title="Hapus"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Apakah Anda yakin ingin menghapus pengguna <span className="font-bold text-gray-900">{userToDelete?.nama_lengkap}</span> secara permanen?
              <br />
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-gray-200 text-gray-700">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-100"
            >
              Hapus Permanen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
