# Tasks: Friend Management Implementation

## Relevant Files

### Database & Schema
- `server/src/db/schema/friendships.schema.ts` - Database schema for friend relationships and requests
- `server/src/db/schema/users.schema.ts` - Extended user schema for friend-related fields
- `server/supabase/migrations/[timestamp]_friendships.sql` - Migration file for friendship tables
- `server/supabase/migrations/[timestamp]_users_update.sql` - Migration to update users table

### Components
- `src/components/friends/FriendsList.tsx` - Main friends list component with online/offline sections
- `src/components/friends/FriendSearch.tsx` - Friend discovery and search interface  
- `src/components/friends/FriendRequests.tsx` - Friend request management component
- `src/components/friends/UserCard.tsx` - Reusable user profile card component

### State Management & Hooks
- `src/stores/friends.ts` - Zustand store for friend management state
- `src/hooks/useFriends.ts` - Custom hook for friend operations
- `src/hooks/useRealtime.ts` - Custom hook for Supabase Realtime subscriptions

### API & Utilities
- `src/utils/friendsApi.ts` - API functions for friend operations
- `src/utils/contacts.ts` - Phone contacts integration utilities
- `src/utils/notifications.ts` - Friend request notification utilities
- `src/types/friends.ts` - TypeScript interfaces for friend-related data

### Tests
- `src/components/friends/__tests__/FriendsList.test.tsx` - Tests for friends list component
- `src/components/friends/__tests__/FriendSearch.test.tsx` - Tests for friend search
- `src/components/friends/__tests__/UserCard.test.tsx` - Tests for user card component
- `src/utils/__tests__/friendsApi.test.ts` - Tests for friend API functions
- `src/stores/__tests__/friends.test.ts` - Tests for friends store

### Notes

- Unit tests should typically be placed alongside the code files they are testing
- Use `npx jest [optional/path/to/test/file]` to run tests
- Phone contacts integration requires proper permissions handling

## Tasks

- [ ] 1.0 Database Schema & Backend Setup
  - [ ] 1.1 Create friendships table schema with status, timestamps, and foreign keys to users
  - [ ] 1.2 Update users schema to include username, display_name, last_seen, and online_status fields
  - [ ] 1.3 Create database indexes for efficient friend queries (user_id, friend_id, status)
  - [ ] 1.4 Generate and apply Supabase migration for friendship tables
  - [ ] 1.5 Set up Row Level Security (RLS) policies for friendship data access
  - [ ] 1.6 Create database functions for common friend operations (mutual friends, friend count)

- [ ] 2.0 Friend Discovery & Search Implementation
  - [ ] 2.1 Create username search API endpoint that returns user profiles
  - [ ] 2.2 Implement phone contacts access using Expo Contacts API
  - [ ] 2.3 Create contact matching function to find existing users by phone number
  - [ ] 2.4 Build FriendSearch component with search input and results list
  - [ ] 2.5 Create UserCard component for displaying user profiles in search results
  - [ ] 2.6 Add search debouncing and loading states for better UX
  - [ ] 2.7 Implement contact permissions handling and error states

- [ ] 3.0 Friend Request System
  - [ ] 3.1 Create friend request API endpoints (send, accept, decline, cancel)
  - [ ] 3.2 Implement duplicate request prevention logic
  - [ ] 3.3 Build FriendRequests component for incoming and outgoing requests
  - [ ] 3.4 Add friend request buttons to UserCard component with proper states
  - [ ] 3.5 Create friend request notifications using Supabase Realtime
  - [ ] 3.6 Implement request status tracking (pending, accepted, declined)
  - [ ] 3.7 Add confirmation dialogs for accepting/declining requests

- [ ] 4.0 Friends List UI & Management
  - [ ] 4.1 Create FriendsList component with online and all friends sections
  - [ ] 4.2 Implement friends sorting (online by activity, all friends alphabetically)
  - [ ] 4.3 Add search functionality within friends list
  - [ ] 4.4 Create remove friend functionality with confirmation dialog
  - [ ] 4.5 Add friend status indicators (online dot, last seen timestamp)
  - [ ] 4.6 Implement pull-to-refresh for friends list updates
  - [ ] 4.7 Add empty states for when user has no friends or no search results

- [ ] 5.0 Real-time Status & Notifications
  - [ ] 5.1 Implement online status tracking when app is active/inactive
  - [ ] 5.2 Set up Supabase Realtime subscriptions for friend status updates
  - [ ] 5.3 Create notification system for new friend requests
  - [ ] 5.4 Add badge indicators for pending friend requests in navigation
  - [ ] 5.5 Implement automatic status updates (last seen timestamps)
  - [ ] 5.6 Create Zustand store for managing friends data and real-time updates
  - [ ] 5.7 Add proper cleanup for Realtime subscriptions on component unmount 