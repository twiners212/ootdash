# 📑 Handover Notes: OOTDash Project
**Tanggal:** 11 Mei 2026  
**Status Sesi:** Scaffolded (Frontend & Backend Ready, DB & Integration Pending)

## 1. Konteks Project
**OOTDash** adalah dashboard cuaca lokal dengan sistem rekomendasi pakaian menggunakan manekin 2D bergaya **Retro Pixel-Art**.
- **User Goal:** Melihat cuaca saat ini dan mendapatkan saran baju (atas, bawah, sepatu, aksesoris) berdasarkan suhu dan kondisi cuaca.
- **Estetika:** "Sunny Retro Blue" (Palette: `#00A8F3`, `#F0F8FF`, `#1A2B45`). Font: `Press Start 2P`.

## 2. Keputusan Teknis & Arsitektur
- **Monorepo-lite:** `/client` (React Vite) dan `/server` (Express TS).
- **State Management:** Zustand (dipilih karena lebih ringan dari Redux untuk project ini).
- **Database & ORM:** PostgreSQL via Supabase Local Docker & Drizzle ORM (untuk *type-safe queries*).
- **API Strategy:** Single-endpoint `GET /api/dashboard` yang menggabungkan data cuaca (OpenWeatherMap) dan logika pencocokan baju di backend untuk mencegah *waterfall requests*.
- **Rendering:** CSS `image-rendering: pixelated;` diwajibkan untuk semua aset PNG agar tidak blur.

## 3. Status Terakhir Project
- **Frontend (`/client`):**
    - UI scaffolded dengan layout *split-screen* (60% Manekin, 40% Weather).
    - `useDashboardStore` dan `useAuthStore` saat ini masih menggunakan **Mock Data/Dummy**.
    - Belum ada aset gambar asli (masih menggunakan placeholder `div` berwarna).
- **Backend (`/server`):**
    - Server running di port 3000.
    - Schema Drizzle sudah lengkap (users, style_profiles, clothing_rules).
    - Logic *weather-to-clothing matching* sudah diimplementasikan di `dashboardController.ts` dengan sistem fallback (jika DB kosong).
- **Infrastructure:**
    - **OpenWeatherMap:** API Key sudah dikonfigurasi di `.env` server. (Tadi sempat 401, kemungkinan karena key baru butuh waktu aktivasi 2 jam).
    - **Supabase/Docker:** Belum berjalan karena Docker Desktop belum terinstall di mesin user.

## 4. Actionable Next Steps (Prioritas Tinggi)
1. **Database Setup:** 
   - User perlu memastikan Docker berjalan, lalu jalankan `npx supabase start` di root.
   - Jalankan `npm run db:push` di folder `server` untuk sinkronisasi schema.
   - Jalankan `npm run db:seed` untuk mengisi aturan pakaian (rules) awal.
2. **Frontend Integration:** 
   - Ubah `useDashboardStore.js` di client agar melakukan `fetch()` asli ke `http://localhost:3000/api/dashboard` (gunakan Bearer Token mock untuk sementara).
3. **Asset Implementation:** 
   - Ganti placeholder di `Mannequin.jsx` dengan aset gambar pixel-art asli di folder `public/layers/`.
4. **Auth Flow:** 
   - Implementasikan login session asli menggunakan `@supabase/supabase-js`.

## 5. Environment Variables Penting
- **Server `.env`:** 
  - `OPENWEATHER_API_KEY`: `your_openweather_api_key_here`
  - `DATABASE_URL`: `postgresql://postgres:postgres@localhost:54322/postgres`

---
*Dokumentasi ini dibuat untuk memastikan kontinuitas pengembangan OOTDash.*
