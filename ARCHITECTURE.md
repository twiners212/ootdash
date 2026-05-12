# ARCHITECTURE.md - OOTDash

## 1. Project Overview
**OOTDash** adalah aplikasi *dashboard* cuaca lokal dengan rekomendasi pakaian (*mannequin system*) bergaya 2D retro pixel-art.
- **Target Host:** Self-hosted di jaringan lokal (Single-Machine).
- **Target User:** Usia 20-40 tahun.
- **Satuan Suhu:** Mutlak Celcius (C).

## 2. Tech Stack
- **Frontend:** React.js (Vite), Tailwind CSS, Zustand (State Management).
- **Backend:** Node.js, Express.js.
- **Database & ORM:** PostgreSQL (via Supabase Local Docker) & Drizzle ORM.
- **Autentikasi:** Supabase Auth (GoTrue).
- **External API:** OpenWeatherMap.

## 3. Directory Structure (Monorepo)
Pemisahan absolut antara UI dan API.

ootdash/
├── ARCHITECTURE.md          -> Dokumen referensi AI
├── supabase/                -> Supabase CLI local config
├── client/                  -> FRONTEND (React)
│   ├── .env                 -> VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
│   ├── public/layers/       -> Aset PNG pixel-art karakter & pakaian
│   └── src/
│       ├── api/             -> Fungsi fetch ke localhost backend
│       ├── components/      -> UI: Mannequin, Weather, Auth
│       ├── lib/             -> supabaseClient.js
│       ├── store/           -> Zustand (useAuthStore, useDashboardStore)
│       └── styles/          -> Tailwind & CSS global
└── server/                  -> BACKEND (Node.js)
    ├── .env                 -> DATABASE_URL, OPENWEATHER_API_KEY, PORT
    ├── drizzle.config.ts    
    └── src/
        ├── db/              -> Drizzle schema & index (koneksi DB)
        ├── controllers/     -> Logika pencocokan cuaca & baju
        ├── middlewares/     -> Validasi JWT token dari Supabase
        ├── routes/          -> Express routes
        └── index.ts         -> Entry point (Port 3000)

## 4. UI/UX & Styling Rules (CRITICAL FOR AI)
- **Layout Layar:** Split-screen. 60% Kiri (Manekin & Rekomendasi Pakaian), 40% Kanan (Informasi Cuaca & Suhu Besar).
- **Mobile Responsive:** Stacked layout (Cuaca di atas, Manekin di bawah).
- **Estetika Pixel-Art:** Semua gambar PNG yang di-render di React **WAJIB** diberikan class/style `image-rendering: pixelated;` agar retro dan tidak blur.
- **Sistem Manekin:** Menggunakan CSS *absolute positioning* untuk menumpuk gambar PNG berlapis (Layer 0: Body, Layer 1: Bawahan, Layer 2: Atasan, Layer 3: Aksesoris).

## 5. State Management (Frontend)
Hindari Redux. Gunakan **Zustand**.
- `useAuthStore`: Mengelola sesi login, user info, dan auth token.
- `useDashboardStore`: Mengelola satu objek JSON besar hasil respon dari backend (data cuaca + baju).

## 6. API Contract (Backend)
Menggunakan **Satu Endpoint Gabungan** untuk mencegah waterfall requests dan menyederhanakan UI.
- **Endpoint:** `GET /api/dashboard?lat={x}&lon={y}`
- **Auth:** Bearer Token (JWT Supabase).
- **Response Format:**
  ```json
  {
    "status": "success",
    "data": {
      "weather": {
        "temperature": 24,
        "condition": "Cerah Berawan",
        "locationName": "Salatiga"
      },
      "recommendation": {
        "top": { "itemName": "...", "note": "...", "layerImage": "/layers/..." },
        "bottom": { "itemName": "...", "note": "...", "layerImage": "/layers/..." },
        "shoes": { "itemName": "...", "note": "...", "layerImage": "/layers/..." },
        "accessories": { "itemName": "...", "note": "...", "layerImage": "/layers/..." }
      }
    }
  }

## 7. Database Schema (Drizzle ORM)
import { pgTable, serial, varchar, integer, date, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const genderEnum = pgEnum('gender', ['Pria', 'Wanita', 'Unisex']);
export const weatherConditionEnum = pgEnum('weather_condition', ['Cerah', 'Berawan', 'Hujan', 'Badai']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  birthDate: date('birth_date').notNull(),
  gender: genderEnum('gender').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const styleProfiles = pgTable('style_profiles', {
  id: serial('id').primaryKey(),
  profileName: varchar('profile_name', { length: 100 }).notNull(),
  targetGender: genderEnum('target_gender').notNull(),
  imageUrl: varchar('image_url', { length: 255 }),
});

export const userPreferences = pgTable('user_preferences', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  styleProfileId: integer('style_profile_id').references(() => styleProfiles.id),
});

export const clothingRules = pgTable('clothing_rules', {
  id: serial('id').primaryKey(),
  styleProfileId: integer('style_profile_id').references(() => styleProfiles.id, { onDelete: 'cascade' }),
  minTemp: integer('min_temp').notNull(),
  maxTemp: integer('max_temp').notNull(),
  weatherCondition: weatherConditionEnum('weather_condition').notNull(),
  topItem: varchar('top_item', { length: 100 }).notNull(),
  topNote: text('top_note').notNull(),
  bottomItem: varchar('bottom_item', { length: 100 }).notNull(),
  bottomNote: text('bottom_note').notNull(),
  shoesItem: varchar('shoes_item', { length: 100 }).notNull(),
  shoesNote: text('shoes_note').notNull(),
  accItem: varchar('acc_item', { length: 100 }),
  accNote: text('acc_note'),
});

export const usersRelations = relations(users, ({ one }) => ({
  preference: one(userPreferences, { fields: [users.id], references: [userPreferences.userId] }),
}));
export const styleProfilesRelations = relations(styleProfiles, ({ many }) => ({
  rules: many(clothingRules),
}));


## 8. Color Palette (Sunny Retro Blue)
- **Primary Blue:** `#00A8F3` (Sky Blue)
- **Secondary White:** `#F0F8FF` (Cloud White)
- **Surface White:** `#FFFFFF` (Pure White)
- **Outline & Text:** `#1A2B45` (Midnight Navy) - *Use for retro pixel borders.*
- **Accent Gold:** `#FFD700` (Sun Yellow) - *Use for highlights.*