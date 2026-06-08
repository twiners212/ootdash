# OOTDash (Outfit of the Day Dashboard)

OOTDash adalah dashboard cuaca lokal interaktif yang dilengkapi dengan sistem rekomendasi pakaian menggunakan manekin 2D dinamis bergaya **Retro Pixel-Art**. Aplikasi ini secara cerdas mencocokkan kondisi cuaca dan suhu real-time dengan koleksi baju untuk memberikan rekomendasi gaya harian terbaik bagi pengguna.

---

## 🎨 Fitur Utama

- **Weather-Based Recommendations**: Menghitung rekomendasi pakaian (atasan, bawahan, sepatu, aksesoris) berdasarkan data suhu dan cuaca real-time dari OpenWeatherMap API.
- **Dynamic 2D Mannequin**: Manekin bergaya pixel-art yang secara dinamis memuat layer pakaian sesuai dengan rekomendasi sistem.
- **Robust Local Auth**: Sistem autentikasi pengguna lokal menggunakan Supabase Auth (Docker) dengan middleware verifikasi token berbasis ES256 JWKS di backend.
- **Responsive Layout**: Desain responsif bergaya retro "Sunny Retro Blue" yang ramah untuk tampilan desktop maupun perangkat mobile.
- **Offline Graceful Fallback**: Menggunakan data rekomendasi offline bawaan secara otomatis jika server atau API eksternal tidak dapat dihubungi.

---

## 💻 Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Zustand (State Management), Lucide React (Icons).
- **Backend**: Node.js (Express), TypeScript.
- **Database & ORM**: PostgreSQL (via Supabase Local Docker), Drizzle ORM (Type-Safe Query Builder).
- **External Integration**: OpenWeatherMap API & Supabase GoTrue Auth.

---

## 📁 Struktur Folder Proyek

```
ootdash/
├── docs/               # Dokumentasi teknis & arsitektur proyek
├── supabase/           # File konfigurasi dan migrasi database lokal
├── client/             # Aplikasi Frontend (React + Vite)
│   ├── public/         # Aset statis & layer gambar manekin
│   └── src/
│       ├── components/ # Komponen UI utama
│       ├── hooks/      # Custom React hooks (useGeolocation)
│       ├── lib/        # File konfigurasi library (supabaseClient)
│       ├── store/      # State management (Zustand stores)
│       └── styles/     # Global stylesheets
└── server/             # Aplikasi Backend (Express TS)
    └── src/
        ├── controllers/# Logika utama pemrosesan data & cuaca
        ├── db/         # Skema database & seeder
        ├── middlewares/# Middleware auth & JWT validator
        └── routes/     # Konfigurasi endpoint Express
```

---

## 🛠️ Langkah Instalasi

### Prasyarat
- **Node.js** (v18 ke atas)
- **Docker Desktop** (untuk database Supabase lokal)

### 1. Kloning Repositori
```bash
git clone https://github.com/username/ootdash.git
cd ootdash
```

### 2. Jalankan Database Lokal (Supabase)
Pastikan Docker Desktop aktif, lalu jalankan perintah berikut pada direktori root proyek:
```bash
npx supabase start
```

### 3. Setup Backend (Server)
1. Masuk ke folder server:
   ```bash
   cd server
   ```
2. Pasang dependensi:
   ```bash
   npm install
   ```
3. Buat file `.env` berdasarkan template `.env.example`, lalu masukkan API Key OpenWeather Anda:
   ```bash
   cp .env.example .env
   ```
4. Sinkronisasikan skema dan isi data awal database:
   ```bash
   npm run db:push
   npm run db:seed
   ```

### 4. Setup Frontend (Client)
1. Masuk ke folder client:
   ```bash
   cd ../client
   ```
2. Pasang dependensi:
   ```bash
   npm install
   ```

---

## 🏃 Cara Menjalankan Proyek

1. **Jalankan Backend (Express):**
   Di folder `server/`:
   ```bash
   npm run dev
   ```
   Server akan berjalan di [http://localhost:3000](http://localhost:3000).

2. **Jalankan Frontend (React):**
   Di folder `client/`:
   ```bash
   npm run dev
   ```
   Aplikasi client akan berjalan di [http://localhost:5173](http://localhost:5173).

---

## 📦 Cara Build Proyek

Untuk memproduksi bundel siap rilis:

- **Build Client (Frontend):**
  Di folder `client/`:
  ```bash
  npm run build
  ```
  Output hasil build akan terletak pada folder `client/dist/`.

- **Build Server (Backend):**
  Di folder `server/`:
  ```bash
  npm run build
  ```
  Kode JavaScript hasil kompilasi TypeScript akan terletak pada folder `server/dist/`.
