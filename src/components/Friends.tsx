/**
 * @file FriendSearch component for searching and discovering users
 * Provides a search interface with debounced input and real-time results display
 */

import { type UserSearchResultWithStatus as UserResult } from '@/api/friends';
import { useFriendRequestsStore } from '@/stores/friendRequests';
import { useFriendsStore } from '@/stores/friends';
import { useUserStore } from '@/stores/user';
import { FontAwesome } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SectionList,
  Text,
  TextInput,
  View
} from 'react-native';
import FriendRequestCard, { type FriendRequestWithUser } from './FriendRequestCard';
import UserSearchResult from './UserSearchResult';

/**
 * Friends Component
 * 
 * @returns JSX element for friend search interface
 */
export default function Friends() {
  const { currentUser } = useUserStore();
  const {
    searchQuery,
    searchResults,
    isSearchLoading,
    searchError,
    setSearchQuery,
    fetchSearchResults,
    clearSearch,
    removeFriend,
    isFriendRemovalInProgress,
  } = useFriendsStore();

  const {
    sendFriendRequestAction,
    actionStates,
    validationErrors,
    clearValidationErrors,
    receivedRequests,
    sentRequests,
    loadFriendRequests,
    acceptFriendRequestAction,
    declineFriendRequestAction,
  } = useFriendRequestsStore();

  const [sections, setSections] = useState<any[]>([]);

  /**
   * Handles sending a friend request to a user
   */
  const handleSendFriendRequest = useCallback(async (targetUser: UserResult) => {
    if (!currentUser?.id) {
      Alert.alert('Error', 'Please sign in to send friend requests');
      return;
    }

    const result = await sendFriendRequestAction(currentUser.id, targetUser.id);
    
    if (result.success) {
      Alert.alert('Success', `Friend request sent to ${targetUser.fullName || targetUser.username}!`);
      // Refresh search results to update button states
      fetchSearchResults(searchQuery, currentUser.id);
    } else {
      Alert.alert('Error', result.error || 'Failed to send friend request');
    }
  }, [currentUser?.id, sendFriendRequestAction, searchQuery, fetchSearchResults]);

  /**
   * Handles removing a friend
   */
  const handleRemoveFriend = useCallback(async (targetUser: UserResult) => {
    if (!currentUser?.id) {
      Alert.alert('Error', 'Could not remove friend. Please try again.');
      return;
    }

    const result = await removeFriend(currentUser.id, targetUser.id);
    
    if (result.success) {
      Alert.alert('Success', `You are no longer friends with ${targetUser.fullName || targetUser.username}.`);
      // Refresh search results to update button states
      fetchSearchResults(searchQuery, currentUser.id);
    } else {
      Alert.alert('Error', result.error || 'Failed to remove friend.');
    }
  }, [currentUser?.id, removeFriend, searchQuery, fetchSearchResults]);

  /**
   * Handles accepting a friend request
   */
  const handleAcceptRequest = useCallback(async (requestId: string) => {
    if (!currentUser?.id) return;
    await acceptFriendRequestAction(requestId, currentUser.id);
  }, [currentUser?.id, acceptFriendRequestAction]);

  /**
   * Handles declining a friend request
   */
  const handleDeclineRequest = useCallback(async (requestId: string) => {
    if (!currentUser?.id) return;
    await declineFriendRequestAction(requestId, currentUser.id);
  }, [declineFriendRequestAction, currentUser?.id]);

  /**
   * Load initial data when component mounts
   */
  useEffect(() => {
    if (!currentUser?.id) return;
    
    fetchSearchResults(searchQuery, currentUser.id);
    loadFriendRequests(currentUser.id);
  }, [currentUser?.id]);

  /**
   * Debounced search effect
   */
  useEffect(() => {
    if (!currentUser?.id) return;

    const timeoutId = setTimeout(() => {
      fetchSearchResults(searchQuery, currentUser.id);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, currentUser?.id, fetchSearchResults]);

  /**
   * Update sections when data changes
   */
  useEffect(() => {
    const newSections = [];

    if (searchResults.length > 0) {
      newSections.push({
        title: 'Users',
        data: searchResults,
        renderItem: renderUserResult,
      });
    }

    const allRequests = [...receivedRequests, ...sentRequests];

    // Sort all requests by creation date, newest first.
    allRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const latestRequests = new Map<string, FriendRequestWithUser>();

    allRequests.forEach(request => {
        if (!currentUser?.id) return;
        const otherUserId = request.requesterId === currentUser.id 
            ? request.addresseeId 
            : request.requesterId;
        
        if (!latestRequests.has(otherUserId)) {
            latestRequests.set(otherUserId, request);
        }
    });

    const uniqueLatestRequests = Array.from(latestRequests.values());

    if (uniqueLatestRequests.length > 0) {
      newSections.push({
        title: 'Requests',
        data: uniqueLatestRequests,
        renderItem: ({ item }: { item: FriendRequestWithUser }) => {
          if (!currentUser?.id) return null;
          const isReceived = item.addresseeId === currentUser.id;
          const reqActionStates = actionStates[item.id] || {};
          return (
            <FriendRequestCard
              friendRequest={item}
              onAccept={handleAcceptRequest}
              onDecline={handleDeclineRequest}
              isAcceptLoading={reqActionStates.isAccepting}
              isDeclineLoading={reqActionStates.isDeclining}
              type={isReceived ? 'received' : 'sent'}
            />
          );
        },
      });
    }
    
    setSections(newSections);
  }, [searchResults, receivedRequests, sentRequests, currentUser?.id, actionStates]);


  /**
   * Show validation errors when they occur
   */
  useEffect(() => {
    if (validationErrors.length > 0) {
      const errorMessage = validationErrors.map(e => e.message).join('\n');
      Alert.alert('Validation Error', errorMessage, [
        { text: 'OK', onPress: clearValidationErrors }
      ]);
    }
  }, [validationErrors, clearValidationErrors]);

  /**
   * Renders the search input field
   */
  const renderSearchInput = () => (
    <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2 mx-4 mb-4">
      <FontAwesome name="search" size={16} color="#6B7280" />
      <TextInput
        className="flex-1 ml-3 text-base"
        placeholder="Search by username or name..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={() => {
          if (currentUser?.id && searchQuery.trim()) {
            fetchSearchResults(searchQuery, currentUser.id);
          }
        }}
      />
             {isSearchLoading && (
         <ActivityIndicator size="small" color="#6B7280" />
       )}
    </View>
  );

  /**
   * Renders a user search result item
   */
  const renderUserResult = ({ item }: { item: UserResult }) => {
    if (!currentUser?.id) return null;

    const isLoading = actionStates[item.id]?.isSending || false;
    const isRemoving = isFriendRemovalInProgress(item.id);

    return (
      <UserSearchResult
        user={item}
        onSendFriendRequest={handleSendFriendRequest}
        onRemoveFriend={handleRemoveFriend}
        isLoading={isLoading}
        isRemoving={isRemoving}
        requestStatus={item.relationshipStatus}
      />
    );
  };

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <View className="bg-gray-100 px-4 py-2">
      <Text className="text-sm font-bold text-gray-600 uppercase">{title}</Text>
    </View>
  );

    /**
   * Renders empty state when no results are found
   */
  const renderEmptyState = () => {
    if (isSearchLoading) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 mt-4">
            {searchQuery.trim() ? 'Searching users...' : 'Loading...'}
          </Text>
        </View>
      );
    }

    if (searchError) {
      return (
        <View className="flex-1 items-center justify-center px-6">
          <FontAwesome name="exclamation-triangle" size={64} color="#EF4444" />
          <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">
            {searchQuery.trim() ? 'Search Error' : 'Loading Error'}
          </Text>
          <Text className="text-gray-500 mt-2 text-center">
            {searchError}
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center px-6">
        <FontAwesome name="users" size={64} color="#D1D5DB" />
        <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">
          Find Friends
        </Text>
        <Text className="text-gray-500 mt-2 text-center">
          Search for friends by their username or name.
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {renderSearchInput()}
      
      {sections.length === 0 ? (
        renderEmptyState()
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => item.id + index}
          renderItem={({ item, section }: { item: any, section: any }) => section.renderItem({ item })}
          renderSectionHeader={renderSectionHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
} 