# Laporan Progres & Verifikasi - OOTDash

Dokumen ini mencatat pencapaian, status fitur saat ini, serta hasil verifikasi sistem untuk proyek **OOTDash**.

---

## 1. Status Proyek Saat Ini

OOTDash telah selesai diimplementasikan sebagai **Minimum Viable Product (MVP)** yang berfungsi penuh dengan arsitektur bersih (*monorepo-lite*) dan siap dipublikasikan sebagai portofolio profesional.

| Fitur / Modul | Status | Keterangan |
|---|---|---|
| **Database Setup** | ✅ Selesai | PostgreSQL berjalan lokal via Supabase Docker CLI. Skema migrasi & data awal berhasil di-seed. |
| **Integrasi API** | ✅ Selesai | Hubungan frontend ke backend lancar dengan fallback offline yang elegan jika server/database utama mati. |
| **Aset Pixel-Art** | ✅ Selesai | 21 aset karakter & pakaian pixel-art dimuat dan ditumpuk secara dinamis menggunakan absolute CSS. |
| **Aliran Autentikasi** | ✅ Selesai | Login, registrasi, dan sesi pengguna terintegrasi penuh dengan token Bearer JWT Supabase. |
| **Deployment Cloud** | ✅ Selesai | Frontend React-Vite telah dideploy di **Vercel** ([https://ootdash.vercel.app/](https://ootdash.vercel.app/)) dan terhubung ke GitHub. |

---

## 2. Pencapaian Utama & Keputusan Teknis

### A. Autentikasi Modern (ES256 JWKS)
Supabase CLI versi terbaru beralih menggunakan algoritma **ES256** (asymmetric ECDSA) untuk enkripsi JWT. Sistem autentikasi pada backend Express dirancang ulang untuk memverifikasi token pengguna secara asinkron lewat endpoint JWKS (`/auth/v1/.well-known/jwks.json`), serta mendukung fallback HS256 untuk kompatibilitas retro.

### B. Demo Mode & Simulasi Login Instan (Untuk Perekrut)
Agar portofolio dapat diuji oleh perekrut tanpa perlu menjalankan Docker/Supabase lokal secara manual, sistem mendeteksi secara otomatis jika database sedang offline, lalu mem-bypass login ke **Demo Mode**. 
*   Kami menambahkan tombol **"Coba Akun Demo"** di halaman login untuk masuk instan dengan sekali klik.
*   Jika database online, tombol ini menggunakan akun seeder nyata (`test@ootdash.local` / `test1234`). Jika offline, tombol menyimulasikan sesi mock (`demo@ootdash.local`) yang disimpan di `localStorage` agar sesi bertahan saat halaman direfresh.

### C. Konfigurasi Vercel Monorepo-Lite Otomatis
Menggunakan konfigurasi build monorepo otomatis di root repositori via root `package.json` dan `vercel.json` agar Vercel dapat mendistribusikan aplikasi frontend dari subfolder `/client` secara instan langsung dari integrasi Git GitHub.

---

## 3. Hasil Pengujian & Verifikasi

### Pengujian Lokal (Manual)
1. **Autentikasi:** Berhasil melakukan registrasi akun baru, login, dan pemeliharaan sesi (session persistence) saat halaman direfresh.
2. **Dashboard Cuaca:** Lokasi terdeteksi otomatis via Geolocation API browser dan menampilkan cuaca Salatiga sebagai lokasi default apabila akses ditolak.
3. **Rekomendasi Manekin:** Manekin menampilkan tumpukan gambar pakaian dengan benar sesuai rekomendasi suhu udara (contoh: Kemeja Flannel & Celana Chino pada suhu 24°C).
4. **Pembersihan Repositori:** Seluruh file kompilasi (`dist/`), temporary, serta rahasia API key telah dihapus dan diabaikan melalui `.gitignore`.

### Pengujian Produksi Live (Vercel)
1. **Pemuatan Aset:** Semua 21 aset layer pixel-art dimuat secara dinamis dari folder public di hosting Vercel tanpa ada error atau masalah blur (`image-rendering: pixelated`).
2. **Verifikasi Demo Mode:** Diuji menggunakan robot browser subagent. Menekan tombol **"Coba Akun Demo"** secara sukses mengarahkan ke dashboard manekin dan menampilkan data cuaca fallback lokal dengan mulus tanpa notifikasi error atau *loading hang*.
3. **Responsivitas:** Antarmuka login dan dashboard terverifikasi responsif pada berbagai dimensi layar (desktop maupun perangkat mobile).

