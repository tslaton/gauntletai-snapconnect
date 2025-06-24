/**
 * @file This file contains API functions for managing friends and friend requests.
 * It provides functions for searching users, managing friendships, and handling friend requests.
 */

import { supabase } from './supabase';

/**
 * Interface for user search results
 */
export interface UserSearchResult {
  id: string;
  username: string | null;
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
}

/**
 * Interface for checking relationship status between users
 */
export interface RelationshipStatus {
  isFriend: boolean;
  hasPendingRequest: boolean;
  sentByCurrentUser: boolean; // If there's a pending request, who sent it
}

/**
 * Interface for friend request data
 */
export interface FriendRequest {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for friend request with user information
 */
export interface FriendRequestWithUser {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  updatedAt: string;
  requester: UserSearchResult;
}

/**
 * Searches for users by username, full name, or email.
 * Excludes the current user from results and filters out existing friends and pending requests.
 * 
 * @param searchQuery - The search term to match against username, fullName, or email
 * @param currentUserId - The ID of the current user to exclude from results
 * @returns Promise resolving to array of matching users
 */
export async function searchUsers(
  searchQuery: string,
  currentUserId: string
): Promise<UserSearchResult[]> {
  console.log('searchUsers called with: ', searchQuery, currentUserId)

  if (!searchQuery.trim()) {
    return [];
  }

  const searchTerm = `%${searchQuery.trim()}%`;

  try {
    // First, get all users matching the search query
    const { data: searchResults, error: searchError } = await supabase
      .from('profiles')
      .select('id, username, full_name, email, avatar_url')
      .neq('id', currentUserId)
      .or(`username.ilike.${searchTerm},full_name.ilike.${searchTerm},email.ilike.${searchTerm}`)
      .limit(20);

    if (searchError) {
      throw searchError;
    }

    if (!searchResults || searchResults.length === 0) {
      return [];
    }

    // Get list of user IDs from search results
    const userIds = searchResults.map(user => user.id);

    // Check for existing friendships and pending requests in parallel
    const [friendsData, requestsData] = await Promise.all([
      // Check existing friendships
      supabase
        .from('friends')
        .select('friend_id')
        .eq('user_id', currentUserId)
        .in('friend_id', userIds),
      
      // Check pending friend requests (both sent and received)
      supabase
        .from('friend_requests')
        .select('requester_id, addressee_id')
        .eq('status', 'pending')
        .or(`and(requester_id.eq.${currentUserId},addressee_id.in.(${userIds.join(',')})),and(addressee_id.eq.${currentUserId},requester_id.in.(${userIds.join(',')}))`)
    ]);

    if (friendsData.error) {
      throw friendsData.error;
    }
    if (requestsData.error) {
      throw requestsData.error;
    }

    // Create sets for faster lookup
    const existingFriendIds = new Set(friendsData.data?.map(f => f.friend_id) || []);
    const pendingRequestUserIds = new Set([
      ...(requestsData.data?.map(r => r.requester_id) || []),
      ...(requestsData.data?.map(r => r.addressee_id) || [])
    ]);

    // Filter out users who are already friends or have pending requests
    const filteredResults = searchResults.filter(user => 
      !existingFriendIds.has(user.id) && !pendingRequestUserIds.has(user.id)
    );

    // Transform the filtered data to match our interface
    return filteredResults.map(user => ({
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      email: user.email,
      avatarUrl: user.avatar_url,
    }));
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
}

/**
 * Fetches friend requests received by the current user
 * 
 * @param currentUserId - The current user's ID
 * @returns Promise resolving to array of received friend requests with user data
 */
export async function fetchReceivedFriendRequests(
  currentUserId: string
): Promise<FriendRequestWithUser[]> {
  try {
    const { data, error } = await supabase
      .from('friend_requests')
      .select(`
        id, 
        requester_id, 
        addressee_id, 
        status, 
        created_at, 
        updated_at,
        profiles!friend_requests_requester_id_profiles_id_fk (
          id, 
          username, 
          full_name, 
          email, 
          avatar_url
        )
      `)
      .eq('addressee_id', currentUserId)
      .in('status', ['pending', 'accepted', 'declined'])
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(request => ({
      id: request.id,
      requesterId: request.requester_id,
      addresseeId: request.addressee_id,
      status: request.status as 'pending' | 'accepted' | 'declined',
      createdAt: request.created_at,
      updatedAt: request.updated_at,
      requester: {
        id: (request.profiles as any).id,
        username: (request.profiles as any).username,
        fullName: (request.profiles as any).full_name,
        email: (request.profiles as any).email,
        avatarUrl: (request.profiles as any).avatar_url,
      },
    }));
  } catch (error) {
    console.error('Error fetching received friend requests:', error);
    throw error;
  }
}

/**
 * Fetches friend requests sent by the current user
 * 
 * @param currentUserId - The current user's ID
 * @returns Promise resolving to array of sent friend requests with user data
 */
export async function fetchSentFriendRequests(
  currentUserId: string
): Promise<FriendRequestWithUser[]> {
  try {
    const { data, error } = await supabase
      .from('friend_requests')
      .select(`
        id, 
        requester_id, 
        addressee_id, 
        status, 
        created_at, 
        updated_at,
        profiles!friend_requests_addressee_id_profiles_id_fk (
          id, 
          username, 
          full_name, 
          email, 
          avatar_url
        )
      `)
      .eq('requester_id', currentUserId)
      .in('status', ['pending', 'accepted', 'declined'])
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(request => ({
      id: request.id,
      requesterId: request.requester_id,
      addresseeId: request.addressee_id,
      status: request.status as 'pending' | 'accepted' | 'declined',
      createdAt: request.created_at,
      updatedAt: request.updated_at,
      requester: {
        id: (request.profiles as any).id,
        username: (request.profiles as any).username,
        fullName: (request.profiles as any).full_name,
        email: (request.profiles as any).email,
        avatarUrl: (request.profiles as any).avatar_url,
      },
    }));
  } catch (error) {
    console.error('Error fetching sent friend requests:', error);
    throw error;
  }
}

/**
 * Sends a friend request to another user
 * 
 * @param currentUserId - The current user's ID (sender)
 * @param targetUserId - The target user's ID (receiver)
 * @returns Promise resolving to the created friend request
 */
export async function sendFriendRequest(
  currentUserId: string,
  targetUserId: string
): Promise<FriendRequest> {
  try {
    // First check if users can send a request (not already friends or have pending request)
    const relationshipStatus = await checkRelationshipStatus(currentUserId, targetUserId);
    
    if (relationshipStatus.isFriend) {
      throw new Error('Users are already friends');
    }
    
    if (relationshipStatus.hasPendingRequest) {
      throw new Error('A friend request already exists between these users');
    }

    // Create the friend request
    const { data, error } = await supabase
      .from('friend_requests')
      .insert({
        requester_id: currentUserId,
        addressee_id: targetUserId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      requesterId: data.requester_id,
      addresseeId: data.addressee_id,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
}

/**
 * Accepts a friend request and creates bidirectional friendship
 * 
 * @param requestId - The ID of the friend request to accept
 * @param currentUserId - The current user's ID (must be the addressee)
 * @returns Promise resolving when friendship is created
 */
export async function acceptFriendRequest(
  requestId: string,
  currentUserId: string
): Promise<void> {
  try {
    // First get the friend request to validate and get user IDs
    const { data: requestData, error: requestError } = await supabase
      .from('friend_requests')
      .select('requester_id, addressee_id, status')
      .eq('id', requestId)
      .single();

    if (requestError) {
      throw requestError;
    }

    if (!requestData) {
      throw new Error('Friend request not found');
    }

    if (requestData.addressee_id !== currentUserId) {
      throw new Error('Only the request addressee can accept this request');
    }

    if (requestData.status !== 'pending') {
      throw new Error('Friend request is not in pending status');
    }

    // Use a transaction to update request status and create friendship
    const { error: transactionError } = await supabase.rpc('accept_friend_request', {
      request_id: requestId,
      requester_id: requestData.requester_id,
      addressee_id: requestData.addressee_id
    });

    if (transactionError) {
      // If the RPC doesn't exist, fall back to manual transaction
      console.warn('RPC function not found, using manual transaction');
      
      // Manual transaction simulation using multiple queries
      // Update friend request status
      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) {
        throw updateError;
      }

      // Create bidirectional friendship records
      const { error: friendsError } = await supabase
        .from('friends')
        .insert([
          {
            user_id: requestData.requester_id,
            friend_id: requestData.addressee_id
          },
          {
            user_id: requestData.addressee_id,
            friend_id: requestData.requester_id
          }
        ]);

      if (friendsError) {
        throw friendsError;
      }
    }
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
}

/**
 * Declines a friend request
 * 
 * @param requestId - The ID of the friend request to decline
 * @param currentUserId - The current user's ID (must be the addressee)
 * @returns Promise resolving when request is declined
 */
export async function declineFriendRequest(
  requestId: string,
  currentUserId: string
): Promise<void> {
  try {
    // First get the friend request to validate
    const { data: requestData, error: requestError } = await supabase
      .from('friend_requests')
      .select('addressee_id, status')
      .eq('id', requestId)
      .single();

    if (requestError) {
      throw requestError;
    }

    if (!requestData) {
      throw new Error('Friend request not found');
    }

    if (requestData.addressee_id !== currentUserId) {
      throw new Error('Only the request addressee can decline this request');
    }

    if (requestData.status !== 'pending') {
      throw new Error('Friend request is not in pending status');
    }

    // Update the request status to declined
    const { error: updateError } = await supabase
      .from('friend_requests')
      .update({ 
        status: 'declined',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (updateError) {
      throw updateError;
    }
  } catch (error) {
    console.error('Error declining friend request:', error);
    throw error;
  }
}

/**
 * Checks the relationship status between current user and another user
 * 
 * @param currentUserId - The current user's ID
 * @param otherUserId - The other user's ID to check relationship with
 * @returns Promise resolving to relationship status
 */
export async function checkRelationshipStatus(
  currentUserId: string,
  otherUserId: string
): Promise<RelationshipStatus> {
  try {
    // Check if they are already friends
    const { data: friendshipData, error: friendshipError } = await supabase
      .from('friends')
      .select('user_id')
      .eq('user_id', currentUserId)
      .eq('friend_id', otherUserId)
      .single();

    if (friendshipError && friendshipError.code !== 'PGRST116') { // PGRST116 = no rows found
      throw friendshipError;
    }

    const isFriend = !!friendshipData;

    // If they're already friends, no need to check for pending requests
    if (isFriend) {
      return {
        isFriend: true,
        hasPendingRequest: false,
        sentByCurrentUser: false,
      };
    }

    // Check for pending friend requests
    const { data: requestData, error: requestError } = await supabase
      .from('friend_requests')
      .select('requester_id, addressee_id')
      .eq('status', 'pending')
      .or(`and(requester_id.eq.${currentUserId},addressee_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},addressee_id.eq.${currentUserId})`)
      .single();

    if (requestError && requestError.code !== 'PGRST116') {
      throw requestError;
    }

    const hasPendingRequest = !!requestData;
    const sentByCurrentUser = requestData?.requester_id === currentUserId;

    return {
      isFriend: false,
      hasPendingRequest,
      sentByCurrentUser,
    };
  } catch (error) {
    console.error('Error checking relationship status:', error);
    throw error;
  }
}

/**
 * Gets the current user's profile information
 * 
 * @param userId - The ID of the user
 * @returns Promise resolving to user profile data
 */
export async function getCurrentUserProfile(userId: string): Promise<UserSearchResult | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, email, avatar_url')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      username: data.username,
      fullName: data.full_name,
      email: data.email,
      avatarUrl: data.avatar_url,
    };
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    throw error;
  }
} 