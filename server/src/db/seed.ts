/**
 * Seed script for OOTDash database.
 * Run with: npx tsx src/db/seed.ts
 * 
 * Prerequisites: DATABASE_URL must be set in .env and the database must be running.
 * Run `npm run db:push` first to create the tables.
 */
import dotenv from 'dotenv';
dotenv.config();

import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

const { Pool } = pg;

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log('🌱 Seeding OOTDash database...\n');

  // --- 1. Seed Style Profiles ---
  console.log('📦 Inserting style profiles...');
  const insertedProfiles = await db.insert(schema.styleProfiles).values([
    { profileName: 'Kasual Pria', targetGender: 'Pria' },
    { profileName: 'Kasual Wanita', targetGender: 'Wanita' },
    { profileName: 'Sporty Unisex', targetGender: 'Unisex' },
  ]).returning();

  const kasualPria = insertedProfiles.find(p => p.profileName === 'Kasual Pria')!;
  const kasualWanita = insertedProfiles.find(p => p.profileName === 'Kasual Wanita')!;
  const sportyUnisex = insertedProfiles.find(p => p.profileName === 'Sporty Unisex')!;

  console.log(`   ✅ Inserted ${insertedProfiles.length} profiles\n`);

  // --- 2. Seed Clothing Rules ---
  console.log('👕 Inserting clothing rules...');

  const clothingData = [
    // === KASUAL PRIA ===
    // Cerah - Hot (30+)
    { styleProfileId: kasualPria.id, minTemp: 30, maxTemp: 45, weatherCondition: 'Cerah' as const,
      topItem: 'Kaos Polos Putih', topNote: 'Warna terang memantulkan panas matahari',
      bottomItem: 'Celana Pendek Chino', bottomNote: 'Pendek dan adem untuk cuaca panas',
      shoesItem: 'Sandal Kulit', shoesNote: 'Breathable dan santai',
      accItem: 'Kacamata Hitam', accNote: 'Lindungi mata dari UV' },
    // Cerah - Warm (24-29)
    { styleProfileId: kasualPria.id, minTemp: 24, maxTemp: 29, weatherCondition: 'Cerah' as const,
      topItem: 'Polo Shirt', topNote: 'Smart casual untuk cuaca hangat',
      bottomItem: 'Celana Chino', bottomNote: 'Nyaman dan rapi',
      shoesItem: 'Sneakers Putih', shoesNote: 'Clean look untuk jalan-jalan',
      accItem: 'Topi Baseball', accNote: 'Perlindungan dari sinar matahari' },
    // Cerah - Cool (18-23)
    { styleProfileId: kasualPria.id, minTemp: 18, maxTemp: 23, weatherCondition: 'Cerah' as const,
      topItem: 'Kemeja Flannel', topNote: 'Hangat tapi tetap stylish',
      bottomItem: 'Celana Jeans', bottomNote: 'Klasik dan serbaguna',
      shoesItem: 'Boots Casual', shoesNote: 'Tampilan rugged yang keren',
      accItem: 'Jam Tangan', accNote: 'Aksesoris minimalis' },
    // Berawan - Warm (24-29)
    { styleProfileId: kasualPria.id, minTemp: 24, maxTemp: 29, weatherCondition: 'Berawan' as const,
      topItem: 'Kaos Henley', topNote: 'Kasual tapi lebih berkarakter',
      bottomItem: 'Jogger Pants', bottomNote: 'Fleksibel untuk segala aktivitas',
      shoesItem: 'Sneakers', shoesNote: 'Nyaman untuk mobilitas',
      accItem: null, accNote: null },
    // Berawan - Cool (18-23)
    { styleProfileId: kasualPria.id, minTemp: 18, maxTemp: 23, weatherCondition: 'Berawan' as const,
      topItem: 'Sweater Rajut', topNote: 'Layer hangat untuk cuaca mendung',
      bottomItem: 'Celana Chino', bottomNote: 'Pas untuk tampilan layered',
      shoesItem: 'Loafers', shoesNote: 'Elegan tanpa ribet',
      accItem: 'Syal Tipis', accNote: 'Tambahan kehangatan yang stylish' },
    // Hujan - Any temp
    { styleProfileId: kasualPria.id, minTemp: 15, maxTemp: 35, weatherCondition: 'Hujan' as const,
      topItem: 'Jaket Parasut', topNote: 'Waterproof dan ringan',
      bottomItem: 'Celana Panjang', bottomNote: 'Melindungi dari percikan air',
      shoesItem: 'Boots Tahan Air', shoesNote: 'Anti selip di lantai basah',
      accItem: 'Payung Lipat', accNote: 'Wajib dibawa saat musim hujan' },
    // Badai - Any temp
    { styleProfileId: kasualPria.id, minTemp: 10, maxTemp: 35, weatherCondition: 'Badai' as const,
      topItem: 'Jaket Tebal Waterproof', topNote: 'Perlindungan maksimal dari angin dan hujan',
      bottomItem: 'Celana Cargo Tebal', bottomNote: 'Tahan lama dan fungsional',
      shoesItem: 'Boots Tinggi', shoesNote: 'Anti banjir dan kokoh',
      accItem: 'Payung Kokoh', accNote: 'Pastikan payung kuat terhadap angin kencang' },

    // === KASUAL WANITA ===
    // Cerah - Hot (30+)
    { styleProfileId: kasualWanita.id, minTemp: 30, maxTemp: 45, weatherCondition: 'Cerah' as const,
      topItem: 'Blouse Linen', topNote: 'Bahan alami yang adem dan breathable',
      bottomItem: 'Rok Midi', bottomNote: 'Feminin dan sejuk',
      shoesItem: 'Flat Sandals', shoesNote: 'Ringan dan nyaman',
      accItem: 'Topi Lebar', accNote: 'Melindungi wajah dari sinar UV' },
    // Cerah - Warm (24-29)
    { styleProfileId: kasualWanita.id, minTemp: 24, maxTemp: 29, weatherCondition: 'Cerah' as const,
      topItem: 'Crop Top', topNote: 'Trendy untuk cuaca hangat',
      bottomItem: 'Celana Kulot', bottomNote: 'Lebar dan adem',
      shoesItem: 'Sneakers', shoesNote: 'Serasi untuk jalan-jalan',
      accItem: 'Kacamata Hitam', accNote: 'Stylish sekaligus fungsional' },
    // Berawan
    { styleProfileId: kasualWanita.id, minTemp: 18, maxTemp: 29, weatherCondition: 'Berawan' as const,
      topItem: 'Cardigan', topNote: 'Layer ringan yang feminin',
      bottomItem: 'Celana Jeans', bottomNote: 'Pas untuk tampilan kasual',
      shoesItem: 'Slip-on', shoesNote: 'Mudah dipakai dan dilepas',
      accItem: 'Tas Selempang', accNote: 'Praktis untuk bawa barang' },
    // Hujan
    { styleProfileId: kasualWanita.id, minTemp: 15, maxTemp: 35, weatherCondition: 'Hujan' as const,
      topItem: 'Jaket Denim + Inner', topNote: 'Layering stylish tahan gerimis',
      bottomItem: 'Celana Panjang Stretch', bottomNote: 'Nyaman dan cepat kering',
      shoesItem: 'Ankle Boots', shoesNote: 'Modis sekaligus tahan air',
      accItem: 'Payung Transparan', accNote: 'Lucu dan fungsional!' },
    // Badai
    { styleProfileId: kasualWanita.id, minTemp: 10, maxTemp: 35, weatherCondition: 'Badai' as const,
      topItem: 'Parka Panjang', topNote: 'Perlindungan penuh dari hujan dan angin',
      bottomItem: 'Legging Tebal', bottomNote: 'Hangat dan fleksibel',
      shoesItem: 'Rain Boots', shoesNote: 'Anti banjir total',
      accItem: 'Payung Besar', accNote: 'Ukuran besar untuk perlindungan ekstra' },

    // === SPORTY UNISEX ===
    // Cerah
    { styleProfileId: sportyUnisex.id, minTemp: 24, maxTemp: 45, weatherCondition: 'Cerah' as const,
      topItem: 'Dri-Fit Jersey', topNote: 'Cepat kering dan breathable',
      bottomItem: 'Running Shorts', bottomNote: 'Fleksibel untuk olahraga',
      shoesItem: 'Running Shoes', shoesNote: 'Support terbaik untuk lari',
      accItem: 'Headband', accNote: 'Menyerap keringat di dahi' },
    // Berawan
    { styleProfileId: sportyUnisex.id, minTemp: 18, maxTemp: 29, weatherCondition: 'Berawan' as const,
      topItem: 'Track Jacket', topNote: 'Windbreaker ringan untuk outdoor',
      bottomItem: 'Training Pants', bottomNote: 'Nyaman bergerak',
      shoesItem: 'Cross Trainers', shoesNote: 'Multifungsi untuk segala medan',
      accItem: 'Smartwatch', accNote: 'Track aktivitas dan cuaca' },
    // Hujan
    { styleProfileId: sportyUnisex.id, minTemp: 15, maxTemp: 35, weatherCondition: 'Hujan' as const,
      topItem: 'Windbreaker Waterproof', topNote: 'Tetap aktif walau hujan',
      bottomItem: 'Compression Tights', bottomNote: 'Cepat kering dan hangat',
      shoesItem: 'Trail Running Shoes', shoesNote: 'Grip kuat di permukaan basah',
      accItem: 'Buff/Neck Gaiter', accNote: 'Pelindung leher dari angin dingin' },
  ];

  await db.insert(schema.clothingRules).values(clothingData);
  console.log(`   ✅ Inserted ${clothingData.length} clothing rules\n`);

  console.log('✨ Seeding complete!\n');
  console.log('Profiles created:');
  insertedProfiles.forEach(p => console.log(`   - [${p.id}] ${p.profileName} (${p.targetGender})`));
  
  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
