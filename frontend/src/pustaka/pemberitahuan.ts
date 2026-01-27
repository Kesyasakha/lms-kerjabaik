import { Notify, Confirm, Loading, Block } from 'notiflix';

// Inisialisasi konfigurasi global untuk Notiflix
Notify.init({
    width: '320px',
    position: 'right-top', // Pojok kanan atas agar umum digunakan
    distance: '15px',
    opacity: 1,
    borderRadius: '8px',
    timeout: 3000,
    messageMaxLength: 110,
    backOverlay: false,
    clickToClose: true,
    pauseOnHover: true,
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    cssAnimation: true,
    cssAnimationDuration: 400,
    cssAnimationStyle: 'fade', // Opsi: 'fade', 'zoom', 'from-right', 'from-top'
    useIcon: true,
    useFontAwesome: false,
    fontAwesomeIconStyle: 'basic',
    fontAwesomeIconSize: '34px',
    success: {
        background: '#10b981', // Emerald-500
        textColor: '#fff',
        childClassName: 'notiflix-notify-success',
        notiflixIconColor: 'rgba(0,0,0,0.2)',
        fontAwesomeClassName: 'fas fa-check-circle',
        fontAwesomeIconColor: 'rgba(0,0,0,0.2)',
        backOverlayColor: 'rgba(16,185,129,0.2)',
    },
    failure: {
        background: '#ef4444', // Red-500
        textColor: '#fff',
        childClassName: 'notiflix-notify-failure',
        notiflixIconColor: 'rgba(0,0,0,0.2)',
        fontAwesomeClassName: 'fas fa-times-circle',
        fontAwesomeIconColor: 'rgba(0,0,0,0.2)',
        backOverlayColor: 'rgba(239,68,68,0.2)',
    },
    warning: {
        background: '#f59e0b', // Amber-500
        textColor: '#fff',
        childClassName: 'notiflix-notify-warning',
        notiflixIconColor: 'rgba(0,0,0,0.2)',
        fontAwesomeClassName: 'fas fa-exclamation-circle',
        fontAwesomeIconColor: 'rgba(0,0,0,0.2)',
        backOverlayColor: 'rgba(245,158,11,0.2)',
    },
    info: {
        background: '#3b82f6', // Blue-500
        textColor: '#fff',
        childClassName: 'notiflix-notify-info',
        notiflixIconColor: 'rgba(0,0,0,0.2)',
        fontAwesomeClassName: 'fas fa-info-circle',
        fontAwesomeIconColor: 'rgba(0,0,0,0.2)',
        backOverlayColor: 'rgba(59,130,246,0.2)',
    },
});

Confirm.init({
    width: '350px',
    borderRadius: '12px',
    titleColor: '#1f2937',
    okButtonBackground: '#10b981',
    cancelButtonBackground: '#ef4444',
    fontFamily: 'Inter, sans-serif',
    cssAnimation: true,
    cssAnimationStyle: 'fade',
    backOverlayColor: 'rgba(0,0,0,0.5)',
});

/**
 * Utilitas untuk menampilkan notifikasi dalam Bahasa Indonesia yang baku.
 */
export const pemberitahuan = {
    /**
     * Menampilkan notifikasi sukses.
     */
    sukses: (pesan: string) => {
        Notify.success(pesan);
    },

    /**
     * Menampilkan notifikasi kesalahan.
     */
    gagal: (pesan: string) => {
        Notify.failure(pesan);
    },

    /**
     * Menampilkan notifikasi peringatan.
     */
    peringatan: (pesan: string) => {
        Notify.warning(pesan);
    },

    /**
     * Menampilkan notifikasi informasi.
     */
    info: (pesan: string) => {
        Notify.info(pesan);
    },

    /**
     * Menampilkan dialog konfirmasi.
     */
    konfirmasi: (
        judul: string,
        pesan: string,
        padaOk: () => void,
        padaBatal?: () => void,
        teksOk = 'Lanjutkan',
        teksBatal = 'Batal'
    ) => {
        Confirm.show(judul, pesan, teksOk, teksBatal, padaOk, padaBatal);
    },

    /**
     * Menampilkan loading overlay.
     */
    tampilkanPemuatan: (pesan = 'Sedang memproses...') => {
        Loading.standard(pesan);
    },

    /**
     * Menghilangkan loading overlay.
     */
    hilangkanPemuatan: () => {
        Loading.remove();
    },

    /**
     * Memblokir elemen tertentu.
     */
    blokir: (selector: string, pesan = 'Sudang memuat...') => {
        Block.standard(selector, pesan);
    },

    /**
     * Membuka blokir elemen tertentu.
     */
    bukaBlokir: (selector: string) => {
        Block.remove(selector);
    }
};
