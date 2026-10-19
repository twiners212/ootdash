# OOTDash (Outfit of the Day Dashboard)

> 🌐 **Live Demo:** [https://ootdash.vercel.app](https://ootdash.vercel.app)

## 📸 Demo Tampilan Aplikasi

| Halaman Login (Demo Mode) | Halaman Dashboard Utama |
|:---:|:---:|
| ![Login Page](docs/screenshots/login.png) | ![Dashboard Page](docs/screenshots/dashboard.png) |

OOTDash adalah dashboard cuaca lokal interaktif yang dilengkapi dengan sistem rekomendasi pakaian menggunakan manekin 2D dinamis bergaya **Retro Pixel-Art**. Aplikasi ini secara cerdas mencocokkan kondisi cuaca dan suhu real-time dengan koleksi baju untuk memberikan rekomendasi gaya harian terbaik bagi pengguna.

---

## 🎨 Fitur Utama

- **Weather-Based Recommendations**: Menghitung rekomendasi pakaian (atasan, bawahan, sepatu, aksesoris) berdasarkan data suhu dan cuaca real-time dari OpenWeatherMap API.
- **Dynamic 2D Mannequin**: Manekin bergaya pixel-art yang secara dinamis memuat layer pakaian sesuai dengan rekomendasi sistem.
- **Robust Cloud Auth**: Sistem autentikasi pengguna menggunakan Better Auth dengan database PostgreSQL cloud (Neon), terintegrasi penuh di backend.
- **Full-Stack Vercel Serverless**: Frontend dan Backend Express disatukan dalam satu repository monorepo dan di-deploy bersamaan ke Vercel menggunakan Serverless Functions (`/api`).
- **Responsive Layout**: Desain responsif bergaya retro "Sunny Retro Blue" yang ramah untuk tampilan desktop maupun perangkat mobile.
- **Offline Graceful Fallback**: Menggunakan data rekomendasi offline bawaan secara otomatis jika server atau API eksternal tidak dapat dihubungi.

---

## 💻 Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Zustand (State Management), Lucide React (Icons).
- **Backend**: Node.js (Express), TypeScript, Vercel Serverless Functions.
- **Database & ORM**: PostgreSQL (Cloud via Neon), Drizzle ORM (Type-Safe Query Builder).
- **External Integration**: OpenWeatherMap API & Better Auth.
- **Deployment & Hosting**: Vercel (Frontend CDN + Serverless API).

---

## 📁 Struktur Folder Proyek

```
ootdash/
├── api/                # Entry point Vercel Serverless Function (api/index.ts)
├── client/             # Aplikasi Frontend (React + Vite)
│   ├── public/         # Aset statis & layer gambar manekin
│   └── src/
│       ├── components/ # Komponen UI utama
│       ├── hooks/      # Custom React hooks (useGeolocation)
│       ├── lib/        # File konfigurasi library (auth-client.js)
│       ├── store/      # State management (Zustand stores)
│       └── styles/     # Global stylesheets
├── server/             # Aplikasi Backend (Express TS)
│   └── src/
│       ├── controllers/# Logika utama pemrosesan data & cuaca
│       ├── db/         # Skema database & seeder
│       ├── lib/        # Konfigurasi Better Auth & koneksi database
│       ├── middlewares/# Middleware auth & JWT validator
│       ├── routes/     # Konfigurasi endpoint Express
│       ├── app.ts      # Definisi Express app & middleware CORS
│       └── index.ts    # Server listener untuk local dev
├── vercel.json         # Konfigurasi routing Vercel (/api/* -> serverless, /* -> SPA)
└── package.json        # Root monorepo configuration (npm workspaces)
```

---

## 🛠️ Langkah Instalasi Lokal

### Prasyarat
- **Node.js** (v20 ke atas disarankan)
- Akun **Neon Database** (PostgreSQL)
- API Key **OpenWeatherMap**

### 1. Kloning Repositori & Instalasi
Aplikasi ini menggunakan fitur **npm workspaces** sehingga instalasi dependensi cukup dilakukan di root folder:
```bash
git clone https://github.com/twiners212/ootdash.git
cd ootdash
npm install
```

### 2. Konfigurasi Environment (Server)
1. Buat file `.env` di dalam folder `server/` berdasarkan template `.env.example`:
   ```bash
   cd server
   cp .env.example .env
   ```
2. Isi variabel di `server/.env`:
   ```env
   PORT=3000
   DATABASE_URL=postgresql://user:password@ep-xxxx-pooler.region.aws.neon.tech/ootdash?sslmode=require
   OPENWEATHER_API_KEY=your_openweather_api_key
   BETTER_AUTH_SECRET=your_better_auth_secret_32_chars_minimum
   BETTER_AUTH_URL=http://localhost:3000
   NODE_ENV=development
   ```
3. Sinkronisasikan skema dan isi data awal database (style profiles & clothing rules):
   ```bash
   npm run db:push
   npm run db:seed
   ```
4. Kembali ke root direktori:
   ```bash
   cd ..
   ```

### 3. Konfigurasi Client
Frontend secara otomatis menggunakan URL relatif (`/api/...`). Pada mode pengembangan lokal, Vite dev server akan otomatis mem-proxy request `/api` ke `http://localhost:3000` melalui konfigurasi proxy di `client/vite.config.js`. Anda tidak perlu mengatur `VITE_API_URL` secara manual untuk penggunaan standar.

---

## 🏃 Cara Menjalankan Proyek di Lokal

Berkat **npm workspaces** dan `concurrently`, Anda dapat menjalankan backend dan frontend sekaligus secara paralel cukup dengan satu perintah dari **root direktori**:

```bash
npm run dev
```

- Server Express akan berjalan di [http://localhost:3000](http://localhost:3000).
- Client Vite akan berjalan di [http://localhost:5173](http://localhost:5173) (otomatis me-reverse proxy `/api` ke port 3000).

---

## 🚀 Panduan Deployment ke Vercel

Proyek ini telah dikonfigurasi sebagai **pure monorepo full-stack** yang terintegrasi langsung dengan Vercel:

1. **Hubungkan Repositori ke Vercel:**
   Impor repository `twiners212/ootdash` di Vercel Dashboard.
2. **Atur Environment Variables di Vercel:**
   Masuk ke **Project Settings → Environment Variables** dan tambahkan:
   - `DATABASE_URL`: Connection string PostgreSQL dari Neon (disarankan endpoint berakhiran `-pooler`).
   - `OPENWEATHER_API_KEY`: API Key OpenWeatherMap yang aktif.
   - `BETTER_AUTH_SECRET`: String acak 32 karakter untuk enkripsi session.
   - `BETTER_AUTH_URL`: `https://<nama-project-anda>.vercel.app` (contoh: `https://ootdash.vercel.app`).
3. **Deploy:**
   Vercel akan otomatis membaca `vercel.json`, membangun frontend ke `client/dist`, dan mengekspor backend Express sebagai Serverless Function pada endpoint `/api`.
