/**
 * @file This file contains the Drizzle schema for the 'profiles' table.
 * It defines the structure, constraints, and relationships for user profile data.
 */

import { sql } from 'drizzle-orm';
import {
  check,
  index,
  pgSchema,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

/**
 * Defines the 'auth' schema for Supabase.
 * This is used to reference tables like 'users' within that schema.
 */
export const authSchema = pgSchema('auth');

/**
 * This is a reference to the `users` table in Supabase's `auth` schema.
// ... existing code ...
 * key relationship for the `profiles.id` column.
 */
export const users = authSchema.table('users', {
  id: uuid('id').primaryKey(),
});

/**
 * Drizzle schema for the 'profiles' table.
 * This table stores public information for users, extending the base
 * user data from `auth.users`.
 */
export const profiles = pgTable('profiles', {
  // The user's unique identifier. This MUST match the id in `auth.users`.
  id: uuid('id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),

  // The timestamp when the profile was last updated.
  updatedAt: timestamp('updated_at', { withTimezone: true }),

  // The user's unique username.
  username: text('username').unique(),

  // The user's full name.
  fullName: text('full_name'),

  // The user's email address for contact purposes.
  email: text('email'),

  // URL for the user's avatar image.
  avatarUrl: text('avatar_url'),

  // URL for the user's personal website.
  website: text('website'),
}, (table) => ({
  // Index for efficient full name searches
  fullNameIdx: index('profiles_full_name_idx').on(table.fullName),
  
  // Index for efficient email searches
  emailIdx: index('profiles_email_idx').on(table.email),
  
  // Composite index for efficient username + full name searches
  usernameFullNameIdx: index('profiles_username_full_name_idx').on(table.username, table.fullName),
}));

/**
 * Defines a check constraint on the `profiles` table to ensure that
 * usernames are at least 3 characters long.
 */
export const profilesUsernameLength = check(
  'username_length',
  sql`char_length(${profiles.username}) >= 3`,
);