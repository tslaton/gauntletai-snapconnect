/**
 * @file This file contains API functions for managing conversations and conversation participants.
 * It provides functions for creating conversations, managing participants, and fetching conversation lists.
 */

import {
  ConversationParticipant,
  ConversationWithDetails,
  fetchLatestMessage,
  getUnreadMessageCount
} from '@/api/messages';
import { supabase } from '@/utils/supabase';

/**
 * Interface for creating a new conversation
 */
export interface CreateConversationData {
  type: 'direct' | 'group';
  title?: string; // Required for group conversations, null for direct
  participantIds: string[]; // User IDs to add as participants
}

/**
 * Interface for adding participants to a conversation
 */
export interface AddParticipantData {
  conversationId: string;
  userIds: string[];
}

/**
 * Custom error types for conversation management
 */
export class ConversationValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ConversationValidationError';
  }
}

export class ParticipantError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParticipantError';
  }
}

/**
 * Conversation validation constants
 */
const CONVERSATION_LIMITS = {
  MIN_TITLE_LENGTH: 1,
  MAX_TITLE_LENGTH: 100,
  MAX_PARTICIPANTS: 50,
  MIN_PARTICIPANTS_GROUP: 1,
  MAX_PARTICIPANTS_DIRECT: 1,
} as const;

/**
 * Validates UUID format
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Sanitizes conversation title
 */
function sanitizeTitle(title: string): string {
  return title.replace(/<[^>]*>/g, '').trim();
}

/**
 * Validates conversation creation data
 */
function validateCreateConversationData(data: CreateConversationData, currentUserId: string): void {
  if (!currentUserId || !isValidUUID(currentUserId)) {
    throw new ConversationValidationError('Invalid user ID', 'currentUserId');
  }

  if (!data.type || !['direct', 'group'].includes(data.type)) {
    throw new ConversationValidationError('Invalid conversation type', 'type');
  }

  if (data.type === 'direct') {
    if (data.participantIds.length !== CONVERSATION_LIMITS.MAX_PARTICIPANTS_DIRECT) {
      throw new ConversationValidationError('Direct conversations must have exactly one other participant', 'participantIds');
    }
    if (data.title) {
      throw new ConversationValidationError('Direct conversations cannot have a title', 'title');
    }
  } else if (data.type === 'group') {
    if (data.participantIds.length < CONVERSATION_LIMITS.MIN_PARTICIPANTS_GROUP) {
      throw new ConversationValidationError('Group conversations must have at least one other participant', 'participantIds');
    }
    if (!data.title || !data.title.trim()) {
      throw new ConversationValidationError('Group conversations must have a title', 'title');
    }
    const sanitizedTitle = sanitizeTitle(data.title);
    if (sanitizedTitle.length < CONVERSATION_LIMITS.MIN_TITLE_LENGTH) {
      throw new ConversationValidationError('Group title cannot be empty', 'title');
    }
    if (sanitizedTitle.length > CONVERSATION_LIMITS.MAX_TITLE_LENGTH) {
      throw new ConversationValidationError(`Group title cannot exceed ${CONVERSATION_LIMITS.MAX_TITLE_LENGTH} characters`, 'title');
    }
  }

  if (data.participantIds.length > CONVERSATION_LIMITS.MAX_PARTICIPANTS) {
    throw new ConversationValidationError(`Cannot add more than ${CONVERSATION_LIMITS.MAX_PARTICIPANTS} participants`, 'participantIds');
  }

  // Validate all participant IDs
  for (const participantId of data.participantIds) {
    if (!participantId || !isValidUUID(participantId)) {
      throw new ConversationValidationError('Invalid participant ID found', 'participantIds');
    }
    if (participantId === currentUserId) {
      throw new ConversationValidationError('Cannot add yourself as a participant', 'participantIds');
    }
  }

  // Check for duplicate participant IDs
  const uniqueParticipants = new Set(data.participantIds);
  if (uniqueParticipants.size !== data.participantIds.length) {
    throw new ConversationValidationError('Duplicate participant IDs found', 'participantIds');
  }
}

/**
 * Creates a new conversation and adds participants.
 * For direct conversations, ensures only two participants and no title.
 * 
 * @param conversationData - The conversation data to create
 * @param currentUserId - The ID of the current user creating the conversation
 * @returns Promise resolving to the created conversation with participants
 */
export async function createConversation(
  conversationData: CreateConversationData,
  currentUserId: string
): Promise<ConversationWithDetails> {
  try {
    // Validate all input data
    validateCreateConversationData(conversationData, currentUserId);

    // Sanitize title for group conversations
    const sanitizedTitle = conversationData.type === 'group' && conversationData.title 
      ? sanitizeTitle(conversationData.title) 
      : null;

    // For direct conversations, check if one already exists between these users
    if (conversationData.type === 'direct') {
      const existingConversation = await findDirectConversation(
        currentUserId, 
        conversationData.participantIds[0]
      );
      if (existingConversation) {
        return existingConversation;
      }
    }

    // Validate that current user is friends with all participants (for direct conversations)
    if (conversationData.type === 'direct') {
      // Check friendship in both directions since friends table is bidirectional
      for (const participantId of conversationData.participantIds) {
        const { data: friendship, error: friendshipError } = await supabase
          .from('friends')
          .select('user_id, friend_id')
          .or(`and(user_id.eq.${currentUserId},friend_id.eq.${participantId}),and(user_id.eq.${participantId},friend_id.eq.${currentUserId})`)
          .limit(1);

        if (friendshipError) {
          console.error('Database error checking friendship:', friendshipError);
          throw new ParticipantError('Failed to verify friend relationships');
        }

        if (!friendship || friendship.length === 0) {
          throw new ParticipantError('You can only create direct conversations with your friends');
        }
      }
    }

    // Create the conversation
    const { data: conversationResult, error: conversationError } = await supabase
      .from('conversations')
      .insert({
        type: conversationData.type,
        title: sanitizedTitle,
      })
      .select()
      .single();

    if (conversationError) {
      console.error('Database error creating conversation:', conversationError);
      throw new Error('Failed to create conversation. Please try again.');
    }

    if (!conversationResult) {
      throw new Error('Failed to retrieve created conversation');
    }

    // Add all participants (including current user)
    const allParticipantIds = [currentUserId, ...conversationData.participantIds];
    const participantInserts = allParticipantIds.map(userId => ({
      conversation_id: conversationResult.id,
      user_id: userId,
      is_active: true,
    }));

    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert(participantInserts);

    if (participantsError) {
      console.error('Database error adding participants:', participantsError);
      throw new ParticipantError('Failed to add participants to conversation');
    }

    // Fetch the complete conversation with participants
    const conversation = await fetchConversationById(conversationResult.id, currentUserId);
    if (!conversation) {
      throw new Error('Failed to fetch created conversation');
    }
    
    return conversation;
  } catch (error) {
    // Re-throw custom errors as-is
    if (error instanceof ConversationValidationError || 
        error instanceof ParticipantError) {
      throw error;
    }

    // Log unexpected errors and throw generic message
    console.error('Unexpected error creating conversation:', error);
    throw new Error('Failed to create conversation. Please try again.');
  }
}

/**
 * Finds an existing direct conversation between two users.
 * 
 * @param userId1 - The first user's ID
 * @param userId2 - The second user's ID
 * @returns Promise resolving to the conversation or null if none exists
 */
export async function findDirectConversation(
  userId1: string,
  userId2: string
): Promise<ConversationWithDetails | null> {
  try {
    // Find conversations where both users are participants and type is 'direct'
    const { data: conversationData, error: conversationError } = await supabase
      .from('conversations')
      .select(`
        id,
        type,
        title,
        created_at,
        updated_at,
        conversation_participants!inner (
          user_id
        )
      `)
      .eq('type', 'direct')
      .eq('conversation_participants.user_id', userId1);

    if (conversationError) {
      throw conversationError;
    }

    if (!conversationData || conversationData.length === 0) {
      return null;
    }

    // For each conversation, check if userId2 is also a participant
    for (const conversation of conversationData) {
      const { data: otherParticipant, error: participantError } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conversation.id)
        .eq('user_id', userId2)
        .eq('is_active', true)
        .single();

      if (participantError && participantError.code !== 'PGRST116') {
        continue;
      }

      if (otherParticipant) {
        // Found the direct conversation between these two users
        return await fetchConversationById(conversation.id, userId1);
      }
    }

    return null;
  } catch (error) {
    console.error('Error finding direct conversation:', error);
    return null;
  }
}

/**
 * Fetches all conversations for a user with participants, last message, and unread count.
 * 
 * @param currentUserId - The ID of the current user
 * @returns Promise resolving to array of conversations with details
 */
export async function fetchUserConversations(
  currentUserId: string
): Promise<ConversationWithDetails[]> {
  try {
    // We need to embed the conversation_participants table in the select clause in
    // order to filter by its columns. Using `!inner` performs an inner join so we
    // only get conversations where the current user is an active participant.
    const { data: conversationsData, error: conversationsError } = await supabase
      .from('conversations')
      .select(
        `id,
         type,
         title,
         created_at,
         updated_at,
         conversation_participants!inner ( user_id, is_active )` // required for filtering
      )
      .eq('conversation_participants.user_id', currentUserId)
      .eq('conversation_participants.is_active', true)
      .order('updated_at', { ascending: false });

    if (conversationsError) {
      throw conversationsError;
    }

    if (!conversationsData || conversationsData.length === 0) {
      return [];
    }

    // Fetch details for each conversation in parallel
    const conversationPromises = conversationsData.map(async (conversation) => {
      return await fetchConversationById(conversation.id, currentUserId);
    });

    const conversationsWithDetails = await Promise.all(conversationPromises);
    
    // Filter out any null results and sort by last activity
    return conversationsWithDetails
      .filter(conv => conv !== null)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      
  } catch (error) {
    console.error('Error fetching user conversations:', error);
    throw error;
  }
}

/**
 * Fetches a conversation by ID with all details (participants, last message, unread count).
 * 
 * @param conversationId - The ID of the conversation to fetch
 * @param currentUserId - The ID of the current user
 * @returns Promise resolving to the conversation with details or null if not found/no access
 */
export async function fetchConversationById(
  conversationId: string,
  currentUserId: string
): Promise<ConversationWithDetails | null> {
  try {
    // First, verify user is a participant
    const { data: participantCheck, error: participantError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', currentUserId)
      .eq('is_active', true)
      .single();

    if (participantError && participantError.code !== 'PGRST116') {
      throw participantError;
    }

    if (!participantCheck) {
      return null; // User is not a participant or conversation doesn't exist
    }

    // Fetch conversation details
    const { data: conversationData, error: conversationError } = await supabase
      .from('conversations')
      .select('id, type, title, created_at, updated_at')
      .eq('id', conversationId)
      .single();

    if (conversationError) {
      throw conversationError;
    }

    // Fetch all participants with user details
    const { data: participantsData, error: participantsError } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        user_id,
        joined_at,
        last_read_at,
        is_active,
        profiles!conversation_participants_user_id_profiles_id_fk (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('conversation_id', conversationId)
      .eq('is_active', true);

    if (participantsError) {
      throw participantsError;
    }

    // Fetch last message and unread count in parallel
    const [lastMessage, unreadCount] = await Promise.all([
      fetchLatestMessage(conversationId, currentUserId),
      getUnreadMessageCount(conversationId, currentUserId),
    ]);

    // Transform participants data
    const participants: ConversationParticipant[] = (participantsData || []).map(participant => ({
      conversationId: participant.conversation_id,
      userId: participant.user_id,
      joinedAt: participant.joined_at,
      lastReadAt: participant.last_read_at,
      isActive: participant.is_active,
      user: {
        id: (participant.profiles as any).id,
        username: (participant.profiles as any).username,
        fullName: (participant.profiles as any).full_name,
        avatarUrl: (participant.profiles as any).avatar_url,
      },
    }));

    return {
      id: conversationData.id,
      type: conversationData.type as 'direct' | 'group',
      title: conversationData.title,
      createdAt: conversationData.created_at,
      updatedAt: conversationData.updated_at,
      participants,
      lastMessage: lastMessage || undefined,
      unreadCount,
    };
  } catch (error) {
    console.error('Error fetching conversation by ID:', error);
    return null;
  }
}

/**
 * Adds participants to an existing conversation.
 * Only works for group conversations.
 * 
 * @param addParticipantData - The participant data to add
 * @param currentUserId - The ID of the current user (must be a participant)
 * @returns Promise resolving when participants are added
 */
export async function addParticipants(
  addParticipantData: AddParticipantData,
  currentUserId: string
): Promise<void> {
  try {
    // Verify current user is a participant and conversation is a group
    const conversation = await fetchConversationById(addParticipantData.conversationId, currentUserId);
    
    if (!conversation) {
      throw new Error('Conversation not found or user does not have access');
    }

    if (conversation.type !== 'group') {
      throw new Error('Can only add participants to group conversations');
    }

    // Check which users are not already participants
    const { data: existingParticipants, error: existingError } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', addParticipantData.conversationId)
      .in('user_id', addParticipantData.userIds)
      .eq('is_active', true);

    if (existingError) {
      throw existingError;
    }

    const existingUserIds = new Set(existingParticipants?.map(p => p.user_id) || []);
    const newUserIds = addParticipantData.userIds.filter(id => !existingUserIds.has(id));

    if (newUserIds.length === 0) {
      return; // All users are already participants
    }

    // Add new participants
    const participantInserts = newUserIds.map(userId => ({
      conversation_id: addParticipantData.conversationId,
      user_id: userId,
      is_active: true,
    }));

    const { error: insertError } = await supabase
      .from('conversation_participants')
      .insert(participantInserts);

    if (insertError) {
      throw insertError;
    }

    // Update conversation timestamp
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', addParticipantData.conversationId);

    if (updateError) {
      console.warn('Failed to update conversation timestamp:', updateError);
    }
  } catch (error) {
    console.error('Error adding participants:', error);
    throw error;
  }
}

/**
 * Removes a participant from a conversation.
 * Users can only remove themselves from group conversations (leave group).
 * Direct conversations cannot have participants removed.
 * 
 * @param conversationId - The ID of the conversation
 * @param currentUserId - The ID of the current user performing the action (removes themselves)
 * @returns Promise resolving when participant is removed
 */
export async function leaveConversation(
  conversationId: string,
  currentUserId: string
): Promise<void> {
  try {
    // Verify current user is a participant
    const conversation = await fetchConversationById(conversationId, currentUserId);
    
    if (!conversation) {
      throw new Error('Conversation not found or user does not have access');
    }

    // Users cannot leave direct conversations
    if (conversation.type === 'direct') {
      throw new Error('Cannot leave direct conversations');
    }

    // Users can only leave group conversations
    if (conversation.type !== 'group') {
      throw new Error('Can only leave group conversations');
    }

    // Set the current user as inactive (leave the group)
    const { error: updateError } = await supabase
      .from('conversation_participants')
      .update({ is_active: false })
      .eq('conversation_id', conversationId)
      .eq('user_id', currentUserId);

    if (updateError) {
      throw updateError;
    }

    // Update conversation timestamp
    const { error: conversationUpdateError } = await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    if (conversationUpdateError) {
      console.warn('Failed to update conversation timestamp:', conversationUpdateError);
    }
  } catch (error) {
    console.error('Error leaving conversation:', error);
    throw error;
  }
}

/**
 * Gets or creates a direct conversation between the current user and a friend.
 * If a conversation already exists, returns it. Otherwise, creates a new one.
 * 
 * @param currentUserId - The ID of the current user
 * @param friendId - The ID of the friend to start a conversation with
 * @returns Promise resolving to the conversation
 */
export async function getOrCreateDirectConversation(
  currentUserId: string,
  friendId: string
): Promise<ConversationWithDetails> {
  try {
    // First, check if a direct conversation already exists
    const existingConversation = await findDirectConversation(currentUserId, friendId);
    
    if (existingConversation) {
      return existingConversation;
    }

    // Create a new direct conversation
    return await createConversation(
      {
        type: 'direct',
        participantIds: [friendId],
      },
      currentUserId
    );
  } catch (error) {
    console.error('Error getting or creating direct conversation:', error);
    throw error;
  }
} 