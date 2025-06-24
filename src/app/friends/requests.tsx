/**
 * @file Friend Requests Screen - Displays received and sent friend requests
 * Shows pending requests at the top and history (accepted/declined) below
 */

import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import FriendRequestCard, { type FriendRequestWithUser } from '../../components/FriendRequestCard';
import { useFriendRequestsStore } from '../../stores/friendRequests';
import { useUserStore } from '../../stores/user';

/**
 * Tab types for the friend requests screen
 */
type TabType = 'received' | 'sent';

/**
 * Friend Requests Screen Component
 * 
 * @returns JSX element for friend requests management screen
 */
export default function FriendRequestsScreen() {
  const { currentUser } = useUserStore();
  const {
    receivedRequests,
    sentRequests,
    isLoading,
    isRefreshing,
    actionStates,
    error,
    validationErrors,
    loadFriendRequests,
    acceptFriendRequestAction,
    declineFriendRequestAction,
    clearError,
    clearValidationErrors,
  } = useFriendRequestsStore();
  
  // Tab state (local to this component)
  const [activeTab, setActiveTab] = useState<TabType>('received');

  /**
   * Handles accepting a friend request
   */
  const handleAcceptRequest = async (requestId: string) => {
    if (!currentUser?.id) return;

    const result = await acceptFriendRequestAction(requestId, currentUser.id);
    
    if (result.success) {
      Alert.alert('Success', 'Friend request accepted!');
    } else {
      Alert.alert('Error', result.error || 'Failed to accept friend request');
    }
  };

  /**
   * Handles declining a friend request
   */
  const handleDeclineRequest = async (requestId: string) => {
    if (!currentUser?.id) return;

    const result = await declineFriendRequestAction(requestId, currentUser.id);
    
    if (result.success) {
      Alert.alert('Success', 'Friend request declined');
    } else {
      Alert.alert('Error', result.error || 'Failed to decline friend request');
    }
  };

  /**
   * Load data on component mount and when user changes
   */
  useEffect(() => {
    if (currentUser?.id) {
      loadFriendRequests(currentUser.id);
    }
  }, [currentUser?.id, loadFriendRequests]);

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
   * Renders the header with navigation and title
   */
  const renderHeader = () => (
    <View className="bg-white border-b border-gray-200 px-4 py-3">
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3 p-2 -ml-2"
        >
          <FontAwesome name="arrow-left" size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Friend Requests</Text>
      </View>
    </View>
  );

  /**
   * Renders the tab navigation
   */
  const renderTabs = () => (
    <View className="bg-white border-b border-gray-200">
      <View className="flex-row">
        <TouchableOpacity
          className={`flex-1 py-4 items-center border-b-2 ${
            activeTab === 'received' 
              ? 'border-blue-600' 
              : 'border-transparent'
          }`}
          onPress={() => setActiveTab('received')}
        >
          <Text className={`font-medium ${
            activeTab === 'received' 
              ? 'text-blue-600' 
              : 'text-gray-500'
          }`}>
            Received ({receivedRequests.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className={`flex-1 py-4 items-center border-b-2 ${
            activeTab === 'sent' 
              ? 'border-blue-600' 
              : 'border-transparent'
          }`}
          onPress={() => setActiveTab('sent')}
        >
          <Text className={`font-medium ${
            activeTab === 'sent' 
              ? 'text-blue-600' 
              : 'text-gray-500'
          }`}>
            Sent ({sentRequests.length})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /**
   * Renders empty state for when there are no requests
   */
  const renderEmptyState = (type: TabType) => {
    const isReceived = type === 'received';
    
    return (
      <View className="flex-1 items-center justify-center px-6">
        <FontAwesome 
          name={isReceived ? "user-plus" : "paper-plane"} 
          size={64} 
          color="#D1D5DB" 
        />
        <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">
          {isReceived ? 'No friend requests' : 'No pending requests'}
        </Text>
        <Text className="text-gray-500 mt-2 text-center">
          {isReceived 
            ? "When someone sends you a friend request, it will appear here"
            : "Friend requests you've sent will appear here"
          }
        </Text>
        {isReceived && (
          <TouchableOpacity
            className="bg-blue-600 px-6 py-3 rounded-lg mt-6"
            onPress={() => router.push('/friends/search')}
          >
            <Text className="text-white font-medium">Find Friends</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  /**
   * Renders a friend request item
   */
  const renderFriendRequest = (item: FriendRequestWithUser, type: TabType) => (
    <FriendRequestCard
      key={item.id}
      friendRequest={item}
      type={type}
      onAccept={handleAcceptRequest}
      onDecline={handleDeclineRequest}
      isAcceptLoading={actionStates[item.id]?.isAccepting || false}
      isDeclineLoading={actionStates[item.id]?.isDeclining || false}
    />
  );

  /**
   * Filters requests by status
   */
  const getRequestsByStatus = (requests: FriendRequestWithUser[], status: string) => {
    return requests.filter(request => request.status === status);
  };

  /**
   * Gets all pending and history data for current tab
   */
  const getCurrentTabData = () => {
    const requests = activeTab === 'received' ? receivedRequests : sentRequests;
    
    return {
      pending: getRequestsByStatus(requests, 'pending'),
      accepted: getRequestsByStatus(requests, 'accepted'),
      declined: getRequestsByStatus(requests, 'declined')
    };
  };

  /**
   * Renders error state
   */
  const renderError = () => (
    <View className="flex-1 items-center justify-center px-6">
      <FontAwesome name="exclamation-triangle" size={64} color="#EF4444" />
      <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">
        Something went wrong
      </Text>
      <Text className="text-gray-500 mt-2 text-center">
        {error}
      </Text>
      <TouchableOpacity
        className="bg-blue-600 px-6 py-3 rounded-lg mt-6"
        onPress={() => {
          clearError();
          if (currentUser?.id) {
            loadFriendRequests(currentUser.id);
          }
        }}
      >
        <Text className="text-white font-medium">Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  /**
   * Renders loading state
   */
  const renderLoading = () => (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text className="text-gray-500 mt-4">Loading friend requests...</Text>
    </View>
  );

  // Show loading state on initial load
  if (isLoading && !isRefreshing) {
    return (
      <View className="flex-1 bg-gray-50">
        {renderHeader()}
        {renderTabs()}
        {renderLoading()}
      </View>
    );
  }

  // Show error state
  if (error && !isRefreshing) {
    return (
      <View className="flex-1 bg-gray-50">
        {renderHeader()}
        {renderTabs()}
        {renderError()}
      </View>
    );
  }

  const { pending, accepted, declined } = getCurrentTabData();
  const hasAnyRequests = pending.length > 0 || accepted.length > 0 || declined.length > 0;

  return (
    <View className="flex-1 bg-gray-50">
      {renderHeader()}
      {renderTabs()}
      
      {!hasAnyRequests ? (
        renderEmptyState(activeTab)
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                if (currentUser?.id) {
                  loadFriendRequests(currentUser.id, true);
                }
              }}
              colors={['#3B82F6']}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {/* Pending Requests Section */}
          {pending.length > 0 && (
            <View className="mb-6">
              <View className="bg-white px-4 py-3 border-b border-gray-200">
                <Text className="text-lg font-semibold text-gray-900">
                  Pending ({pending.length})
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  {activeTab === 'received' 
                    ? 'Requests awaiting your response' 
                    : 'Requests you\'ve sent'}
                </Text>
              </View>
              {pending.map(request => renderFriendRequest(request, activeTab))}
            </View>
          )}

          {/* History Section */}
          {(accepted.length > 0 || declined.length > 0) && (
            <View>
              <View className="bg-white px-4 py-3 border-b border-gray-200">
                <Text className="text-lg font-semibold text-gray-900">
                  History ({accepted.length + declined.length})
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Past request activity
                </Text>
              </View>
              
              {/* Accepted Requests */}
              {accepted.map(request => renderFriendRequest(request, activeTab))}
              
              {/* Declined Requests */}
              {declined.map(request => renderFriendRequest(request, activeTab))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
} 