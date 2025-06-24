/**
 * @file This file contains the Drizzle schema for the 'friends' and 'friend_requests' tables.
 * It defines the structure for managing friend relationships and friend requests between users.
 */

import { pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { profiles } from './profiles.schema';

/**
 * Drizzle schema for the 'friends' table.
 * This table manages mutual friend relationships between users.
 * Each friendship is represented by two rows (bidirectional relationship).
 */
export const friends = pgTable('friends', {
  // The user who is the friend requester/owner of this friendship record
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),

  // The user who is the friend (the other party in the friendship)
  friendId: uuid('friend_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),

  // The timestamp when the friendship was established
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => ({
  // Composite primary key to ensure uniqueness of friendship pairs
  pk: primaryKey({ columns: [table.userId, table.friendId] }),
}));

/**
 * Drizzle schema for the 'friend_requests' table.
 * This table manages pending friend requests between users.
 */
export const friendRequests = pgTable('friend_requests', {
  // Unique identifier for the friend request
  id: uuid('id').primaryKey().defaultRandom(),

  // The user who sent the friend request
  requesterId: uuid('requester_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),

  // The user who received the friend request
  addresseeId: uuid('addressee_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),

  // The status of the friend request: 'pending', 'accepted', 'declined'
  status: text('status')
    .notNull()
    .default('pending'),

  // The timestamp when the request was created
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),

  // The timestamp when the request was last updated (accepted/declined)
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
}); 