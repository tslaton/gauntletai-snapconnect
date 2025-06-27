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
  TouchableOpacity,
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

    // Get all user IDs from friend requests
    const requestUserIds = new Set([
      ...receivedRequests.map(r => r.requesterId),
      ...sentRequests.map(r => r.addresseeId)
    ]);

    // Only show Users section if there's a search query
    if (searchQuery.trim() && searchResults.length > 0) {
      // Filter out users who already have pending requests
      const filteredResults = searchResults.filter(user => !requestUserIds.has(user.id));
      
      if (filteredResults.length > 0) {
        newSections.push({
          title: 'Users',
          data: filteredResults,
          renderItem: renderUserResult,
        });
      }
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
    <View className="px-4 pt-2 pb-4">
      <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
        <FontAwesome name="search" size={16} color="#6B7280" />
        <TextInput
          className="flex-1 ml-3 text-base text-gray-900"
          placeholder="Search by username or name..."
          placeholderTextColor="#9CA3AF"
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
        {searchQuery.length > 0 && !isSearchLoading && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            className="ml-2 p-1"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <FontAwesome name="times-circle" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        )}
        {isSearchLoading && (
          <ActivityIndicator size="small" color="#9333EA" />
        )}
      </View>
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
    <View className="bg-gray-50 px-4 py-3 border-t border-gray-100">
      <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</Text>
    </View>
  );

    /**
   * Renders empty state when no results are found
   */
  const renderEmptyState = () => {
    if (isSearchLoading) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#9333EA" />
          <Text className="text-gray-500 mt-4">
            {searchQuery.trim() ? 'Searching users...' : 'Loading...'}
          </Text>
        </View>
      );
    }

    if (searchError) {
      return (
        <View className="flex-1 items-center justify-center px-6">
          <View className="bg-white rounded-2xl p-8 shadow-sm items-center">
            <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-4">
              <FontAwesome name="exclamation-circle" size={40} color="#DC2626" />
            </View>
            <Text className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery.trim() ? 'Search Error' : 'Loading Error'}
            </Text>
            <Text className="text-gray-500 text-center">
              {searchError}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center px-6">
        <View className="bg-white rounded-2xl p-8 shadow-sm items-center">
          <View className="w-20 h-20 bg-purple-100 rounded-full items-center justify-center mb-4">
            <FontAwesome name="users" size={40} color="#9333EA" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-2">
            Find Friends
          </Text>
          <Text className="text-gray-500 text-center">
            Search for friends by their username or name
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {renderSearchInput()}
      
      {sections.length === 0 ? (
        <View className="flex-1 bg-gray-50">
          {renderEmptyState()}
        </View>
      ) : (
        <View className="flex-1 bg-gray-50">
          <SectionList
            sections={sections}
            keyExtractor={(item, index) => item.id + index}
            renderItem={({ item, section }: { item: any, section: any }) => section.renderItem({ item })}
            renderSectionHeader={renderSectionHeader}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      )}
    </View>
  );
} 