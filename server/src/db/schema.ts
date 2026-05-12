import { pgTable, serial, varchar, integer, date, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- Enums ---
export const genderEnum = pgEnum('gender', ['Pria', 'Wanita', 'Unisex']);
export const weatherConditionEnum = pgEnum('weather_condition', ['Cerah', 'Berawan', 'Hujan', 'Badai']);

// --- Tables ---
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

// --- Relations ---
export const usersRelations = relations(users, ({ one }) => ({
  preference: one(userPreferences, { fields: [users.id], references: [userPreferences.userId] }),
}));

export const styleProfilesRelations = relations(styleProfiles, ({ many }) => ({
  rules: many(clothingRules),
}));

export const clothingRulesRelations = relations(clothingRules, ({ one }) => ({
  styleProfile: one(styleProfiles, { fields: [clothingRules.styleProfileId], references: [styleProfiles.id] }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, { fields: [userPreferences.userId], references: [users.id] }),
  styleProfile: one(styleProfiles, { fields: [userPreferences.styleProfileId], references: [styleProfiles.id] }),
}));
