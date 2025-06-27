# Tasks: Real-time Messaging System

## Relevant Files

- `server/src/db/schema/messages.schema.ts` - Database schema for messages, conversations, and participants ✅
- `server/supabase/migrations/20250624130641_messaging_system.sql` - Database migration for messaging tables ✅
- `server/supabase/migrations/20250624132434_messaging_indexes.sql` - Database indexes for query optimization ✅
- `server/supabase/migrations/20250624133000_messaging_rls_policies.sql` - Row Level Security policies for messaging system ✅
- `server/supabase/migrations/20250624140000_update_profile_trigger.sql` - Fixed profile creation trigger to include email field ✅
- `server/supabase/migrations/20250624145000_fix_rls_recursion.sql` - Fixed infinite recursion in RLS policies ✅
- `server/supabase/migrations/20250624150000_fix_conversations_rls.sql` - Fixed conversations table RLS blocking inserts ✅
- `src/utils/messagesApi.ts` - API functions for sending, receiving, and managing messages (with validation) ✅
- `src/utils/conversationsApi.ts` - API functions for managing conversations and participants (with validation) ✅
- `src/stores/messages.ts` - Zustand store for message data and real-time updates ✅
- `src/stores/conversations.ts` - Zustand store for conversation list and management ✅
- `src/components/ChatScreen.tsx` - Main chat interface for individual conversations ✅
- `src/components/MessageBubble.tsx` - Component for displaying individual messages ✅
- `src/components/MessageInput.tsx` - Component for text input and sending messages ✅
- `src/app/chat/[conversationId].tsx` - Dynamic route for individual chat screens ✅
- `src/app/friends/index.tsx` - Updated friends screen with chat navigation integration ✅
- `src/components/Auth.tsx` - Fixed signup flow to avoid duplicate profile creation ✅
- `src/components/ConversationsList.tsx` - Component for listing all user conversations
- `src/components/ConversationItem.tsx` - Component for individual conversation items in the list
- `src/app/conversations/index.tsx` - Main conversations list screen
- `src/utils/messageExpiration.ts` - Utility functions for message expiration logic

- `src/utils/messagesApi.test.ts` - Unit tests for messages API functions
- `src/stores/messages.test.ts` - Unit tests for messages store
- `src/components/MessageBubble.test.tsx` - Unit tests for MessageBubble component
- `src/components/ConversationsList.test.tsx` - Unit tests for ConversationsList component

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MessageBubble.tsx` and `MessageBubble.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.
- Real-time features will use Supabase Realtime subscriptions for instant message delivery.
- Message expiration will be handled both client-side (for display) and server-side (for cleanup).
- Photo sharing will be implemented in a separate PRD and is not part of this messaging system.
- **Navigation Integration**: Tapping friends in the Friends screen now starts direct conversations and navigates to chat

## Tasks

- [x] 1.0 Database Schema and Backend Infrastructure
  - [x] 1.1 Create conversations table schema with participants support
  - [x] 1.2 Create messages table schema with content, timestamps, and expiration
  - [x] 1.3 Create conversation_participants table for many-to-many relationships
  - [x] 1.4 Generate and apply database migration for messaging system
  - [x] 1.5 Add database indexes for efficient message and conversation queries
- [x] 2.0 Core Messaging API and State Management
  - [x] 2.1 Create API functions for sending and receiving messages
  - [x] 2.2 Create API functions for conversation creation and management
  - [x] 2.3 Build messages Zustand store with real-time state management
  - [x] 2.4 Build conversations Zustand store with list management and unread counts
  - [x] 2.5 Implement message validation and error handling in API functions
- [x] 3.0 Chat Interface and Message Components ✅
  - [x] 3.1 Create MessageBubble component with sent/received styling and timestamps ✅
  - [x] 3.2 Build MessageInput component with text input and send functionality ✅
  - [x] 3.3 Create ChatScreen component with message list and input integration ✅
  - [x] 3.4 Implement message loading states and error handling in chat interface ✅
  - [x] 3.5 Add scroll-to-bottom functionality and message pagination ✅
- [ ] 4.0 Conversation Management and Navigation
  - [ ] 4.1 Create ConversationItem component for displaying conversation previews
  - [ ] 4.2 Build ConversationsList component with search and sorting functionality
  - [ ] 4.3 Implement conversations list screen with navigation to individual chats
  - [x] 4.4 Create dynamic route for individual chat screens with conversation ID ✅
  - [x] 4.5 Add conversation creation flow for starting new chats with friends ✅
- [x] 5.0 Real-time Features and Live Updates ✅
  - [x] 5.1 Set up Supabase Realtime subscriptions for new messages ✅
  - [x] 5.2 Implement real-time message delivery and state synchronization ✅
  - [x] 5.3 Add real-time conversation updates for last message and unread counts ✅
  - [x] 5.4 Handle connection states and offline message queuing ✅
  - [ ] 5.5 Implement typing indicators and online presence (optional enhancement)
- [ ] 6.0 Message Expiration and Cleanup System
  - [x] 6.1 Create message expiration utility functions with 24-hour logic ✅
  - [x] 6.2 Implement client-side filtering of expired messages in displays ✅
  - [ ] 6.3 Set up server-side cleanup job for automatic message deletion
  - [x] 6.4 Handle expired message states in conversation previews ✅
  - [x] 6.5 Add empty conversation states when all messages have expired ✅ 