# Tasks: Friend Management System

## Relevant Files

- `server/src/db/schema/friends.schema.ts` - Database schema for friends relationships and friend requests ✅
- `server/src/db/schema/profiles.schema.ts` - Extended user profiles schema to include email field and search indexes ✅
- `server/supabase/migrations/20250624083632_friends_system.sql` - Database migration for friends tables ✅
- `server/supabase/migrations/20250624084055_profiles_search_indexes.sql` - Database migration for search optimization indexes ✅
- `src/app/friends/index.tsx` - Main friends list screen
- `src/app/friends/FriendSearchScreen.tsx` - Friend discovery/search screen ✅
- `src/app/friends/requests.tsx` - Friend requests management screen ✅
- `src/components/FriendsList.tsx` - Component to display friends list with search
- `src/components/FriendSearch.tsx` - Component for searching and discovering users ✅
- `src/components/FriendRequestCard.tsx` - Component for displaying individual friend requests ✅
- `src/components/UserSearchResult.tsx` - Component for displaying user search results ✅
- `src/stores/user.ts` - Zustand store for current user data management ✅
- `src/stores/friends.ts` - Zustand store for friends data and search operations ✅
- `src/stores/friendRequests.ts` - Zustand store for friend requests data and operations ✅
- `src/utils/friendsApi.ts` - API functions for friend-related operations ✅
- `src/components/FriendsList.test.tsx` - Unit tests for FriendsList component
- `src/components/FriendSearch.test.tsx` - Unit tests for FriendSearch component
- `src/stores/friends.test.ts` - Unit tests for friends store
- `src/utils/friendsApi.test.ts` - Unit tests for friends API functions

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `FriendsList.tsx` and `FriendsList.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [x] 1.0 Database Schema and Backend Setup
  - [x] 1.1 Extend profiles schema to include email field for user contact information
  - [x] 1.2 Create friends table schema with user relationships and timestamps
  - [x] 1.3 Create friend_requests table schema with status tracking
  - [x] 1.4 Generate and apply database migration for friends system
  - [x] 1.5 Add database indexes for efficient name/username searches
- [x] 2.0 Friend Discovery and Search System
  - [x] 2.1 Create user search API function with name/username filtering
  - [x] 2.2 Build FriendSearch component with search input and results display
  - [x] 2.3 Create UserSearchResult component for individual search results
  - [x] 2.4 Implement friend discovery screen with search interface
  - [x] 2.5 Add logic to prevent self-requests and duplicate requests in search results
- [ ] 3.0 Friend Request Management System
  - [x] 3.1 Create API functions for sending, accepting, and declining friend requests
  - [x] 3.2 Build FriendRequestCard component for displaying request details
  - [x] 3.3 Create friend requests screen with sent/received sections
  - [x] 3.4 Implement friend request status management and validation
  - [ ] 3.5 Add friend request notification system integration
- [ ] 4.0 Friends List and Management Interface
  - [ ] 4.1 Create API functions for fetching and managing friends list
  - [ ] 4.2 Build FriendsList component with alphabetical sorting and search
  - [ ] 4.3 Implement friends list screen with search and navigation
  - [ ] 4.4 Add friend removal functionality with confirmation
  - [ ] 4.5 Create navigation between friends list, search, and requests screens
- [ ] 5.0 Real-time Notifications and State Management
  - [ ] 5.1 Set up Zustand stores for friends and friend requests management
  - [ ] 5.2 Implement Supabase Realtime subscriptions for friend request notifications
  - [ ] 5.3 Create real-time state synchronization for friends list updates
  - [ ] 5.4 Add notification handling for new friend requests
  - [ ] 5.5 Integrate state management with all friend-related components 