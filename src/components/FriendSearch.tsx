/**
 * @file FriendSearch component for searching and discovering users
 * Provides a search interface with debounced input and real-time results display
 */

import { FontAwesome } from '@expo/vector-icons';
import React, { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFriendRequestsStore } from '../stores/friendRequests';
import { useFriendsStore } from '../stores/friends';
import { useUserStore } from '../stores/user';
import { type UserSearchResultWithStatus as UserResult } from '../utils/friendsApi';
import UserSearchResult from './UserSearchResult';

/**
 * FriendSearch Component
 * 
 * @returns JSX element for friend search interface
 */
export default function FriendSearch() {
  const { currentUser } = useUserStore();
  const {
    searchQuery,
    searchResults,
    isSearchLoading,
    searchError,
    setSearchQuery,
    fetchSearchResults,
    clearSearch,
  } = useFriendsStore();

  const {
    sendFriendRequestAction,
    actionStates,
    validationErrors,
    clearValidationErrors,
    getRequestStatus,
  } = useFriendRequestsStore();

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
   * Load initial random users when component mounts
   */
  useEffect(() => {
    if (!currentUser?.id) return;
    
    // Load random users initially when there's no search query
    if (!searchQuery.trim()) {
      fetchSearchResults('', currentUser.id);
    }
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

    return (
      <UserSearchResult
        user={item}
        onSendFriendRequest={handleSendFriendRequest}
        isLoading={isLoading}
        requestStatus={item.relationshipStatus}
      />
    );
  };

    /**
   * Renders empty state when no results are found
   */
  const renderEmptyState = () => {
    if (isSearchLoading) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 mt-4">
            {searchQuery.trim() ? 'Searching users...' : 'Loading users...'}
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
        <FontAwesome name="user-times" size={64} color="#D1D5DB" />
        <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">
          No users found
        </Text>
        <Text className="text-gray-500 mt-2 text-center">
          {searchQuery.trim() 
            ? 'Try searching with a different username or name'
            : 'No users available to discover right now'
          }
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {renderSearchInput()}
      
      {searchResults.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderUserResult}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
} 