/**
 * @file This file contains API functions for managing messages and conversations.
 * It provides functions for sending messages, fetching messages, and managing message expiration.
 */

import { supabase } from '@/utils/supabase';

/**
 * Interface for message data
 */
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'photo';
  createdAt: string;
  expiresAt: string;
}

/**
 * Interface for message with sender information
 */
export interface MessageWithSender extends Message {
  sender: {
    id: string;
    username: string | null;
    fullName: string | null;
    avatarUrl: string | null;
  };
}

/**
 * Interface for creating a new message
 */
export interface CreateMessageData {
  conversationId: string;
  content: string;
  type?: 'text' | 'photo';
}

/**
 * Custom error types for better error handling
 */
export class MessageValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'MessageValidationError';
  }
}

export class ConversationAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConversationAccessError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string, public retryAfter: number) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Message content validation constants
 */
const MESSAGE_LIMITS = {
  MIN_CONTENT_LENGTH: 1,
  MAX_CONTENT_LENGTH: 2000,
  MAX_MESSAGES_PER_MINUTE: 30,
} as const;

/**
 * Validates UUID format
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Sanitizes message content to prevent XSS and other attacks
 */
function sanitizeMessageContent(content: string): string {
  // Remove any HTML tags and scripts
  const sanitized = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
  
  return sanitized;
}

/**
 * Validates message data before sending
 */
function validateMessageData(messageData: CreateMessageData, currentUserId: string): void {
  // Validate user ID
  if (!currentUserId || !isValidUUID(currentUserId)) {
    throw new MessageValidationError('Invalid user ID', 'currentUserId');
  }

  // Validate conversation ID
  if (!messageData.conversationId || !isValidUUID(messageData.conversationId)) {
    throw new MessageValidationError('Invalid conversation ID', 'conversationId');
  }

  // Validate content
  if (!messageData.content) {
    throw new MessageValidationError('Message content is required', 'content');
  }

  const trimmedContent = messageData.content.trim();
  if (trimmedContent.length < MESSAGE_LIMITS.MIN_CONTENT_LENGTH) {
    throw new MessageValidationError('Message content cannot be empty', 'content');
  }

  if (trimmedContent.length > MESSAGE_LIMITS.MAX_CONTENT_LENGTH) {
    throw new MessageValidationError(
      `Message content cannot exceed ${MESSAGE_LIMITS.MAX_CONTENT_LENGTH} characters`,
      'content'
    );
  }

  // Validate message type
  if (messageData.type && !['text', 'photo'].includes(messageData.type)) {
    throw new MessageValidationError('Invalid message type', 'type');
  }
}

/**
 * Checks if user is within rate limits for sending messages
 */
async function checkRateLimit(currentUserId: string): Promise<void> {
  try {
    const oneMinuteAgo = new Date();
    oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);

    const { count, error } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('sender_id', currentUserId)
      .gt('created_at', oneMinuteAgo.toISOString());

    if (error) {
      console.warn('Rate limit check failed:', error);
      return; // Allow if check fails
    }

    if (count && count >= MESSAGE_LIMITS.MAX_MESSAGES_PER_MINUTE) {
      throw new RateLimitError(
        `Rate limit exceeded. You can send up to ${MESSAGE_LIMITS.MAX_MESSAGES_PER_MINUTE} messages per minute.`,
        60 // Retry after 60 seconds
      );
    }
  } catch (error) {
    if (error instanceof RateLimitError) {
      throw error;
    }
    console.warn('Rate limit check failed:', error);
    // Allow if check fails due to technical issues
  }
}

/**
 * Interface for conversation data
 */
export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for conversation with participants and last message
 */
export interface ConversationWithDetails extends Conversation {
  participants: ConversationParticipant[];
  lastMessage?: MessageWithSender;
  unreadCount: number;
}

/**
 * Interface for conversation participant
 */
export interface ConversationParticipant {
  conversationId: string;
  userId: string;
  joinedAt: string;
  lastReadAt: string | null;
  isActive: boolean;
  user: {
    id: string;
    username: string | null;
    fullName: string | null;
    avatarUrl: string | null;
  };
}

/**
 * Sends a text message to a conversation with comprehensive validation and error handling.
 * Validates message content, user permissions, rate limits, and sanitizes input.
 * 
 * @param messageData - The message data to send
 * @param currentUserId - The ID of the current user sending the message
 * @returns Promise resolving to the created message with sender info
 * @throws {MessageValidationError} When message data is invalid
 * @throws {ConversationAccessError} When user lacks access to conversation
 * @throws {RateLimitError} When user exceeds rate limits
 */
export async function sendMessage(
  messageData: CreateMessageData,
  currentUserId: string
): Promise<MessageWithSender> {
  try {
    // Validate input data
    validateMessageData(messageData, currentUserId);

    // Check rate limits
    await checkRateLimit(currentUserId);

    // Sanitize message content
    const sanitizedContent = sanitizeMessageContent(messageData.content);
    if (!sanitizedContent.trim()) {
      throw new MessageValidationError('Message content cannot be empty after sanitization', 'content');
    }

    // Validate user participation in conversation
    const { data: participantData, error: participantError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('conversation_id', messageData.conversationId)
      .eq('user_id', currentUserId)
      .eq('is_active', true)
      .single();

    if (participantError && participantError.code !== 'PGRST116') {
      console.error('Database error checking conversation participation:', participantError);
      throw new ConversationAccessError('Failed to verify conversation access');
    }

    if (!participantData) {
      throw new ConversationAccessError('You are not a participant in this conversation');
    }

    // Verify conversation still exists and is accessible
    const { data: conversationData, error: conversationError } = await supabase
      .from('conversations')
      .select('id, type')
      .eq('id', messageData.conversationId)
      .single();

    if (conversationError) {
      console.error('Database error checking conversation:', conversationError);
      throw new ConversationAccessError('Conversation not found or inaccessible');
    }

    if (!conversationData) {
      throw new ConversationAccessError('Conversation not found');
    }

    // Calculate expiration time (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Insert the message with sanitized content
    const { data: messageResult, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: messageData.conversationId,
        sender_id: currentUserId,
        content: sanitizedContent,
        type: messageData.type || 'text',
        expires_at: expiresAt.toISOString(),
      })
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        type,
        created_at,
        expires_at,
        profiles!messages_sender_id_profiles_id_fk (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (messageError) {
      console.error('Database error inserting message:', messageError);
      throw new Error('Failed to send message. Please try again.');
    }

    if (!messageResult) {
      throw new Error('Failed to retrieve sent message');
    }

    // Update conversation's updated_at timestamp
    const { error: conversationUpdateError } = await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', messageData.conversationId);

    if (conversationUpdateError) {
      console.warn('Failed to update conversation timestamp:', conversationUpdateError);
      // Don't throw here as message was sent successfully
    }

    // Validate sender profile data
    if (!messageResult.profiles) {
      console.error('Missing sender profile data in message result');
      throw new Error('Failed to retrieve sender information');
    }

    // Transform the data to match our interface
    return {
      id: messageResult.id,
      conversationId: messageResult.conversation_id,
      senderId: messageResult.sender_id,
      content: messageResult.content,
      type: messageResult.type as 'text' | 'photo',
      createdAt: messageResult.created_at,
      expiresAt: messageResult.expires_at,
      sender: {
        id: (messageResult.profiles as any).id,
        username: (messageResult.profiles as any).username,
        fullName: (messageResult.profiles as any).full_name,
        avatarUrl: (messageResult.profiles as any).avatar_url,
      },
    };
  } catch (error) {
    // Re-throw custom errors as-is
    if (error instanceof MessageValidationError || 
        error instanceof ConversationAccessError || 
        error instanceof RateLimitError) {
      throw error;
    }

    // Log unexpected errors and throw generic message
    console.error('Unexpected error sending message:', error);
    throw new Error('Failed to send message. Please try again.');
  }
}

/**
 * Fetches messages from a conversation that haven't expired yet with comprehensive validation.
 * Only returns messages if the user is a participant in the conversation.
 * 
 * @param conversationId - The ID of the conversation to fetch messages from
 * @param currentUserId - The ID of the current user
 * @param limit - Maximum number of messages to fetch (default: 50, max: 100)
 * @param before - Fetch messages before this timestamp (for pagination)
 * @returns Promise resolving to array of messages with sender info
 * @throws {MessageValidationError} When parameters are invalid
 * @throws {ConversationAccessError} When user lacks access to conversation
 */
export async function fetchMessages(
  conversationId: string,
  currentUserId: string,
  limit: number = 50,
  before?: string
): Promise<MessageWithSender[]> {
  try {
    // Validate input parameters
    if (!conversationId || !isValidUUID(conversationId)) {
      throw new MessageValidationError('Invalid conversation ID', 'conversationId');
    }

    if (!currentUserId || !isValidUUID(currentUserId)) {
      throw new MessageValidationError('Invalid user ID', 'currentUserId');
    }

    // Validate and clamp limit
    if (limit < 1 || limit > 100) {
      throw new MessageValidationError('Limit must be between 1 and 100', 'limit');
    }

    // Validate before timestamp if provided
    if (before && isNaN(new Date(before).getTime())) {
      throw new MessageValidationError('Invalid before timestamp', 'before');
    }

    // Validate user participation in conversation
    const { data: participantData, error: participantError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', currentUserId)
      .eq('is_active', true)
      .single();

    if (participantError && participantError.code !== 'PGRST116') {
      console.error('Database error checking conversation participation:', participantError);
      throw new ConversationAccessError('Failed to verify conversation access');
    }

    if (!participantData) {
      throw new ConversationAccessError('You are not a participant in this conversation');
    }

    // Build the query for messages
    let query = supabase
      .from('messages')
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        type,
        created_at,
        expires_at,
        profiles!messages_sender_id_profiles_id_fk (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('conversation_id', conversationId)
      .gt('expires_at', new Date().toISOString()) // Only non-expired messages
      .order('created_at', { ascending: false })
      .limit(limit);

    // Add pagination if before timestamp is provided
    if (before) {
      query = query.lt('created_at', before);
    }

    const { data: messagesData, error: messagesError } = await query;

    if (messagesError) {
      console.error('Database error fetching messages:', messagesError);
      throw new Error('Failed to fetch messages. Please try again.');
    }

    if (!messagesData) {
      return [];
    }

    // Validate and transform the data to match our interface
    const validMessages = messagesData
      .filter(message => {
        // Filter out messages with invalid data
        if (!message || !message.id || !message.profiles) {
          console.warn('Invalid message data found:', message);
          return false;
        }
        return true;
      })
      .map(message => ({
        id: message.id,
        conversationId: message.conversation_id,
        senderId: message.sender_id,
        content: message.content || '', // Handle null content
        type: (message.type as 'text' | 'photo') || 'text',
        createdAt: message.created_at,
        expiresAt: message.expires_at,
        sender: {
          id: (message.profiles as any).id,
          username: (message.profiles as any).username,
          fullName: (message.profiles as any).full_name,
          avatarUrl: (message.profiles as any).avatar_url,
        },
      }));

    return validMessages;
  } catch (error) {
    // Re-throw custom errors as-is
    if (error instanceof MessageValidationError || 
        error instanceof ConversationAccessError) {
      throw error;
    }

    // Log unexpected errors and throw generic message
    console.error('Unexpected error fetching messages:', error);
    throw new Error('Failed to fetch messages. Please try again.');
  }
}

/**
 * Fetches the latest message from a conversation.
 * Used for conversation list previews.
 * 
 * @param conversationId - The ID of the conversation
 * @param currentUserId - The ID of the current user
 * @returns Promise resolving to the latest message or null if no recent messages
 */
export async function fetchLatestMessage(
  conversationId: string,
  currentUserId: string
): Promise<MessageWithSender | null> {
  try {
    const messages = await fetchMessages(conversationId, currentUserId, 1);
    return messages.length > 0 ? messages[0] : null;
  } catch (error) {
    console.error('Error fetching latest message:', error);
    return null;
  }
}

/**
 * Marks messages as read for a user in a conversation by updating their lastReadAt timestamp.
 * Validates user participation and ensures proper access control.
 * 
 * @param conversationId - The ID of the conversation
 * @param currentUserId - The ID of the current user
 * @returns Promise resolving when messages are marked as read
 * @throws {MessageValidationError} When parameters are invalid
 * @throws {ConversationAccessError} When user lacks access to conversation
 */
export async function markMessagesAsRead(
  conversationId: string,
  currentUserId: string
): Promise<void> {
  try {
    // Validate input parameters
    if (!conversationId || !isValidUUID(conversationId)) {
      throw new MessageValidationError('Invalid conversation ID', 'conversationId');
    }

    if (!currentUserId || !isValidUUID(currentUserId)) {
      throw new MessageValidationError('Invalid user ID', 'currentUserId');
    }

    // Verify user is an active participant before updating
    const { data: participantData, error: participantError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', currentUserId)
      .eq('is_active', true)
      .single();

    if (participantError && participantError.code !== 'PGRST116') {
      console.error('Database error checking conversation participation:', participantError);
      throw new ConversationAccessError('Failed to verify conversation access');
    }

    if (!participantData) {
      throw new ConversationAccessError('You are not a participant in this conversation');
    }

    // Update last read timestamp
    const { error } = await supabase
      .from('conversation_participants')
      .update({ 
        last_read_at: new Date().toISOString() 
      })
      .eq('conversation_id', conversationId)
      .eq('user_id', currentUserId);

    if (error) {
      console.error('Database error updating read status:', error);
      throw new Error('Failed to mark messages as read. Please try again.');
    }
  } catch (error) {
    // Re-throw custom errors as-is
    if (error instanceof MessageValidationError || 
        error instanceof ConversationAccessError) {
      throw error;
    }

    // Log unexpected errors and throw generic message
    console.error('Unexpected error marking messages as read:', error);
    throw new Error('Failed to mark messages as read. Please try again.');
  }
}

/**
 * Counts unread messages for a user in a conversation with comprehensive validation.
 * Returns 0 if user is not a participant or on any error to prevent UI disruption.
 * 
 * @param conversationId - The ID of the conversation
 * @param currentUserId - The ID of the current user
 * @returns Promise resolving to the count of unread messages (0 on error)
 */
export async function getUnreadMessageCount(
  conversationId: string,
  currentUserId: string
): Promise<number> {
  try {
    // Validate input parameters
    if (!conversationId || !isValidUUID(conversationId)) {
      console.warn('Invalid conversation ID provided to getUnreadMessageCount');
      return 0;
    }

    if (!currentUserId || !isValidUUID(currentUserId)) {
      console.warn('Invalid user ID provided to getUnreadMessageCount');
      return 0;
    }

    // Get the user's last read timestamp and verify participation
    const { data: participantData, error: participantError } = await supabase
      .from('conversation_participants')
      .select('last_read_at')
      .eq('conversation_id', conversationId)
      .eq('user_id', currentUserId)
      .eq('is_active', true)
      .single();

    if (participantError) {
      if (participantError.code === 'PGRST116') {
        // User is not a participant, return 0
        return 0;
      }
      console.warn('Database error checking conversation participation for unread count:', participantError);
      return 0;
    }

    if (!participantData) {
      return 0;
    }

    const lastReadAt = participantData.last_read_at;

    // Count messages created after the last read timestamp (or all if never read)
    let query = supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', currentUserId) // Don't count own messages as unread
      .gt('expires_at', new Date().toISOString()); // Only non-expired messages

    if (lastReadAt) {
      query = query.gt('created_at', lastReadAt);
    }

    const { count, error: countError } = await query;

    if (countError) {
      console.warn('Database error counting unread messages:', countError);
      return 0;
    }

    // Ensure count is a valid number
    const unreadCount = count || 0;
    if (typeof unreadCount !== 'number' || unreadCount < 0) {
      console.warn('Invalid unread count received:', unreadCount);
      return 0;
    }

    return unreadCount;
  } catch (error) {
    console.warn('Unexpected error getting unread message count:', error);
    return 0; // Return 0 on any error to prevent UI disruption
  }
} 