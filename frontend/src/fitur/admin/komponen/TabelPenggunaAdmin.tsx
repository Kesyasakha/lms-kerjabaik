import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/komponen/ui/table";
import { Badge } from "@/komponen/ui/badge";
import { Button } from "@/komponen/ui/button";
import { Pencil, Trash2, UserCircle } from "lucide-react";
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
import { formatTanggal, cn } from "@/pustaka/utils";

type Pengguna = Database["public"]["Tables"]["pengguna"]["Row"];

const roleColors: Record<string, string> = {
  superadmin: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-900",
  admin: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900",
  instruktur: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-900",
  pembelajar: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800",
};

const statusColors = {
  aktif: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900",
  nonaktif: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800",
  suspended: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900",
};

interface TabelPenggunaAdminProps {
  users: Pengguna[];
  isLoading?: boolean;
  onEdit: (user: Pengguna) => void;
  onDelete: (user: Pengguna) => void;
}

export function TabelPenggunaAdmin({
  users,
  isLoading,
  onEdit,
  onDelete,
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
      <div className="bg-card rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[35%] pl-6">Nama</TableHead>
              <TableHead className="w-[15%]">Peran</TableHead>
              <TableHead className="w-[15%]">Status</TableHead>
              <TableHead className="w-[20%]">Terdaftar</TableHead>
              <TableHead className="text-center font-semibold text-foreground w-[15%]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell className="pl-6">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                  </div>
                </TableCell>
                <TableCell><div className="h-6 bg-muted animate-pulse rounded w-20" /></TableCell>
                <TableCell><div className="h-6 bg-muted animate-pulse rounded w-16" /></TableCell>
                <TableCell><div className="h-4 bg-muted animate-pulse rounded w-24" /></TableCell>
                <TableCell className="text-center"><div className="h-8 w-8 mx-auto bg-muted animate-pulse rounded-full" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-card rounded-lg border p-12 text-center flex flex-col items-center gap-3">
        <UserCircle className="w-12 h-12 text-muted-foreground/30" />
        <p className="text-muted-foreground font-medium">
          Tidak ada pengguna yang ditemukan dalam organisasi ini
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-lg border overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-[35%] font-semibold text-foreground pl-6 py-3">Nama</TableHead>
              <TableHead className="w-[15%] font-semibold text-foreground py-3">Peran</TableHead>
              <TableHead className="w-[15%] font-semibold text-foreground py-3">Status</TableHead>
              <TableHead className="w-[20%] font-semibold text-foreground py-3">Terdaftar</TableHead>
              <TableHead className="text-center font-semibold text-foreground w-[15%] py-3">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="group transition-colors hover:bg-muted/20">
                <TableCell className="pl-6 py-2.5">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-foreground group-hover:text-blue-600 transition-colors">
                      {user.nama_lengkap}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-2.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-medium capitalize",
                      roleColors[user.role as keyof typeof roleColors]
                    )}
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="py-2.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-semibold rounded-full px-3",
                      statusColors[user.status as keyof typeof statusColors]
                    )}
                  >
                    {user.status === 'suspended' ? 'Ditangguhkan' : user.status === 'nonaktif' ? 'Non-Aktif' : 'Aktif'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap py-2.5">
                  {formatTanggal(user.created_at, "short")}
                </TableCell>
                <TableCell className="text-center py-2.5">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                      onClick={() => onEdit(user)}
                      title="Ubah Data"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                      onClick={() => confirmDelete(user)}
                      title="Hapus User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus user{" "}
              <span className="font-bold text-foreground">{userToDelete?.nama_lengkap}</span>{" "}
              secara permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
