import { useState, useRef } from 'react';
import { useAuthStore, type AuthUser } from '@/fitur/autentikasi/stores/authStore';
import { supabase } from '@/pustaka/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/komponen/ui/card';
import { Input } from '@/komponen/ui/input';
import { Label } from '@/komponen/ui/label';
import { Button } from '@/komponen/ui/button';
import { Badge } from '@/komponen/ui/badge';
import { pemberitahuan } from '@/pustaka/pemberitahuan';
import { motion } from 'framer-motion';
import { User, Phone, Camera, Save, Lock, ShieldCheck, Mail } from 'lucide-react';
import { getInitials, getAvatarColor, cn } from '@/pustaka/utils';

export function ProfilePage() {
    const { user, setUser } = useAuthStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [pemuatan, setPemuatan] = useState(false);
    const [sedangUnggah, setSedangUnggah] = useState(false);
    const [dataForm, setDataForm] = useState({
        namaLengkap: user?.nama_lengkap || '',
        nomorTelepon: user?.nomor_telepon || '',
    });

    const handleSimpanProfil = async () => {
        if (!user) return;
        setPemuatan(true);
        pemberitahuan.tampilkanPemuatan("Sedang menyimpan perubahan profil Anda...");

        try {
            const { data, error } = await supabase
                .from('pengguna')
                // @ts-ignore - Supabase type mismatch pada metode update
                .update({
                    nama_lengkap: dataForm.namaLengkap,
                    nomor_telepon: dataForm.nomorTelepon,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw error;

            // Tentukan field apa saja yang berubah untuk notifikasi yang lebih detail
            const perubahan = [];
            if (dataForm.namaLengkap !== user.nama_lengkap) perubahan.push("Nama Lengkap");
            if (dataForm.nomorTelepon !== user.nomor_telepon) perubahan.push("Nomor Telepon");

            setUser(data as AuthUser);

            if (perubahan.length > 0) {
                pemberitahuan.sukses(`Profil berhasil diperbarui: ${perubahan.join(' & ')} telah disimpan.`);
            } else {
                pemberitahuan.sukses("Profil telah diperbarui tanpa perubahan data.");
            }
        } catch (error: any) {
            pemberitahuan.gagal("Gagal memperbarui profil: " + error.message);
        } finally {
            setPemuatan(false);
            pemberitahuan.hilangkanPemuatan();
        }
    };

    const handleUnggahFoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0 || !user) {
                return;
            }
            setSedangUnggah(true);
            pemberitahuan.tampilkanPemuatan("Sedang memproses foto profil baru Anda...");

            const berkas = event.target.files[0];
            const ekstensiBerkas = berkas.name.split('.').pop();
            const jalurBerkas = `${user.id}/${Math.random()}.${ekstensiBerkas}`;

            // 1. Unggah ke Storage
            const { error: galatUnggah } = await supabase.storage
                .from('avatars')
                .upload(jalurBerkas, berkas);

            if (galatUnggah) throw galatUnggah;

            // 2. Ambil URL Publik
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(jalurBerkas);

            // 3. Perbarui Tabel Pengguna
            const { error: galatPerbarui } = await supabase
                .from('pengguna')
                // @ts-ignore - Supabase type mismatch pada metode update
                .update({ url_foto: publicUrl })
                .eq('id', user.id);

            if (galatPerbarui) throw galatPerbarui;

            // 4. Perbarui State Global
            setUser({ ...user, url_foto: publicUrl } as AuthUser);

            pemberitahuan.sukses("Foto profil telah diperbarui.");
        } catch (error: any) {
            pemberitahuan.gagal("Gagal mengunggah foto. Pastikan Anda sudah membuat bucket 'avatars' di Supabase Storage.");
            console.error(error);
        } finally {
            setSedangUnggah(false);
            pemberitahuan.hilangkanPemuatan();
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-4xl mx-auto space-y-6 pb-8"
        >
            <motion.div variants={itemVariants}>
                <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Profil Saya</h1>
                <p className="text-xs text-gray-500 font-medium">Pengaturan akun dan informasi pribadi Anda.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={itemVariants} className="md:col-span-1 space-y-5">
                    <Card className="overflow-hidden border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl">
                        <div className="h-20 bg-gradient-to-br from-template-primary/20 to-violet-500/20" />
                        <CardContent className="relative pt-0 flex flex-col items-center pb-6">
                            <div className="relative -mt-10 mb-3 group cursor-pointer" onClick={() => {
                                fileInputRef.current?.click();
                            }}>
                                <input
                                    type="file"
                                    className="hidden"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    onChange={handleUnggahFoto}
                                    disabled={sedangUnggah}
                                />
                                <div className={cn(
                                    "h-20 w-20 rounded-full ring-4 ring-white dark:ring-zinc-900 shadow-md flex items-center justify-center text-xl text-white font-black overflow-hidden bg-gray-200",
                                    !user?.url_foto && getAvatarColor(user?.nama_lengkap || '')
                                )}>
                                    {sedangUnggah ? (
                                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                    ) : user?.url_foto ? (
                                        <img src={user.url_foto} alt={user.nama_lengkap} className="h-full w-full object-cover" />
                                    ) : (
                                        getInitials(user?.nama_lengkap || '?')
                                    )}
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="text-white h-5 w-5" />
                                </div>
                            </div>

                            <h3 className="text-base font-bold text-gray-900 dark:text-white text-center line-clamp-1">{user?.nama_lengkap}</h3>
                            <Badge variant="secondary" className="mt-1 font-bold tracking-wider uppercase text-[9px] bg-template-primary/10 text-template-primary border-0 rounded-full px-2.5 py-0.5">
                                {user?.role}
                            </Badge>

                            <div className="w-full mt-5 space-y-2">
                                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                                    <span className="truncate">{user?.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                    <span>Akun Terverifikasi</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl p-5 bg-amber-50/30 border-dashed border-2">
                        <div className="flex gap-3">
                            <Lock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-xs font-bold text-amber-900">Keamanan</h4>
                                <p className="text-[10px] text-amber-700 mt-0.5 leading-relaxed">Ganti kata sandi secara berkala untuk keamanan.</p>
                                <Button
                                    variant="link"
                                    className="p-0 h-auto text-[10px] font-bold text-amber-600 hover:text-amber-800 mt-1"
                                    onClick={() => pemberitahuan.info("Fitur ubah kata sandi akan segera tersedia dalam pembaruan sistem berikutnya.")}
                                >
                                    Ubah Sandi →
                                </Button>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants} className="md:col-span-2">
                    <Card className="border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="border-b bg-gray-50/50 dark:bg-zinc-900/50 px-6 py-4">
                            <CardTitle className="text-base font-bold">Informasi Pribadi</CardTitle>
                            <CardDescription className="text-xs">Perbarui detail profil Anda di bawah ini.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            <div className="grid grid-cols-1 gap-5">
                                <div className="space-y-1.5">
                                    <Label htmlFor="nama" className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Nama Lengkap</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                        <Input
                                            id="nama"
                                            value={dataForm.namaLengkap}
                                            onChange={(e) => setDataForm({ ...dataForm, namaLengkap: e.target.value })}
                                            className="pl-9 h-10 text-sm rounded-xl border-gray-200 focus:ring-template-primary/20"
                                            placeholder="Masukkan nama lengkap"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="telp" className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Nomor Telepon / WhatsApp</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                        <Input
                                            id="telp"
                                            value={dataForm.nomorTelepon}
                                            onChange={(e) => setDataForm({ ...dataForm, nomorTelepon: e.target.value })}
                                            className="pl-9 h-10 text-sm rounded-xl border-gray-200 focus:ring-template-primary/20"
                                            placeholder="Contoh: 081234567890"
                                        />
                                    </div>
                                    <p className="text-[9px] text-gray-400 italic">* Digunakan untuk koordinasi pengerjaan tugas.</p>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end">
                                <Button
                                    onClick={handleSimpanProfil}
                                    disabled={pemuatan || !dataForm.namaLengkap}
                                    className="rounded-xl px-6 h-10 text-sm font-bold shadow-md shadow-template-primary/20 transition-all active:scale-95"
                                >
                                    {pemuatan ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                                            <span>Menyimpan...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Save className="h-3.5 w-3.5" />
                                            <span>Simpan Perubahan</span>
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
