/**
 * @file This file contains the Drizzle schema for the messaging system.
 * It defines the structure for conversations, messages, and conversation participants.
 */

import { boolean, index, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { profiles } from './profiles.schema';

/**
 * Drizzle schema for the 'conversations' table.
 * This table manages conversation threads between users.
 * Can be used for both one-on-one and group conversations.
 */
export const conversations = pgTable('conversations', {
  // Unique identifier for the conversation
  id: uuid('id').primaryKey().defaultRandom(),

  // The type of conversation: 'direct' for one-on-one, 'group' for group chats
  type: text('type')
    .notNull()
    .default('direct'),

  // Optional title for group conversations (null for direct conversations)
  title: text('title'),

  // The timestamp when the conversation was created
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),

  // The timestamp when the conversation was last updated (last message sent)
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => ({
  // Index for sorting conversations by last activity
  updatedAtIdx: index('conversations_updated_at_idx').on(table.updatedAt),
  
  // Index for filtering conversations by type
  typeIdx: index('conversations_type_idx').on(table.type),
}));

/**
 * Drizzle schema for the 'conversation_participants' table.
 * This table manages the many-to-many relationship between users and conversations.
 */
export const conversationParticipants = pgTable('conversation_participants', {
  // The conversation this participant belongs to
  conversationId: uuid('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),

  // The user who is participating in the conversation
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),

  // The timestamp when the user joined the conversation
  joinedAt: timestamp('joined_at', { withTimezone: true })
    .notNull()
    .defaultNow(),

  // The timestamp of the last message the user has read (for unread count)
  lastReadAt: timestamp('last_read_at', { withTimezone: true }),

  // Whether the user is currently active in the conversation
  isActive: boolean('is_active')
    .notNull()
    .default(true),
}, (table) => ({
  // Composite primary key to ensure uniqueness of participant-conversation pairs
  pk: primaryKey({ columns: [table.conversationId, table.userId] }),
  
  // Index for finding user's conversations
  userIdIdx: index('conversation_participants_user_id_idx').on(table.userId),
  
  // Index for unread message calculations
  lastReadAtIdx: index('conversation_participants_last_read_at_idx').on(table.lastReadAt),
  
  // Index for active participants
  isActiveIdx: index('conversation_participants_is_active_idx').on(table.isActive),
}));

/**
 * Drizzle schema for the 'messages' table.
 * This table stores individual messages within conversations.
 */
export const messages = pgTable('messages', {
  // Unique identifier for the message
  id: uuid('id').primaryKey().defaultRandom(),

  // The conversation this message belongs to
  conversationId: uuid('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),

  // The user who sent the message
  senderId: uuid('sender_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),

  // The content of the message (text content)
  content: text('content')
    .notNull(),

  // The type of message: 'text' for text messages, 'photo' for photo messages (future)
  type: text('type')
    .notNull()
    .default('text'),

  // The timestamp when the message was sent
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),

  // The timestamp when the message will expire (24 hours after creation)
  expiresAt: timestamp('expires_at', { withTimezone: true })
    .notNull(),
}, (table) => ({
  // Index for fetching messages in a conversation
  conversationIdIdx: index('messages_conversation_id_idx').on(table.conversationId),
  
  // Index for cleaning up expired messages
  expiresAtIdx: index('messages_expires_at_idx').on(table.expiresAt),
  
  // Composite index for ordered message retrieval in conversations
  conversationCreatedAtIdx: index('messages_conversation_created_at_idx').on(table.conversationId, table.createdAt),
  
  // Index for user-specific message queries
  senderIdIdx: index('messages_sender_id_idx').on(table.senderId),
  
  // Index for message type filtering
  typeIdx: index('messages_type_idx').on(table.type),
})); 