# PRD: Real-time Messaging System

## Introduction/Overview

The Real-time Messaging System enables users to send and receive text messages and photos in real-time with friends and in groups. All messages automatically disappear after 24 hours to maintain the ephemeral nature of the platform. The system supports both one-on-one conversations with friends and group messaging threads.

## Goals

1. Provide seamless real-time messaging capabilities for text and photo sharing
2. Implement automatic message expiration after 24 hours for privacy and ephemeral communication
3. Support both friend-to-friend and group messaging contexts
4. Ensure reliable message delivery and synchronization across devices

## User Stories

- As a user, I want to send text messages to my friends so that I can communicate privately
- As a user, I want to send photos to my friends so that I can share visual content
- As a user, I want to participate in group conversations so that I can communicate with multiple people
- As a user, I want my messages to disappear automatically so that my conversations remain private
- As a user, I want to see new messages immediately so that I can have real-time conversations
- As a user, I want to see when messages were sent so that I can understand the conversation timeline

## Functional Requirements

1. **Text Messaging**: Users must be able to send and receive text messages in real-time
2. **Photo Sharing**: Users must be able to send and receive photos in conversations
3. **Friend Conversations**: Users must be able to message any user who is their friend
4. **Group Conversations**: Users must be able to send messages to groups they belong to
5. **Message Expiration**: All messages (text and photos) must automatically disappear after exactly 24 hours from send time
6. **Real-time Delivery**: Messages must appear instantly for all conversation participants
7. **Conversation Threads**: The system must maintain separate conversation threads for each friend and group
8. **Message Ordering**: Messages must be displayed in chronological order by send time
9. **Timestamp Display**: Each message must show when it was sent
10. **Conversation List**: Users must see a list of their active conversations (friends and groups)
11. **Unread Indicators**: Conversations with new messages must be highlighted in the conversation list
12. **Conversation Navigation**: Users must be able to navigate between different conversation threads

## Non-Goals (Out of Scope)

- Read receipts or delivery confirmations
- Message editing or deletion by users
- Voice messages or video sharing
- Message search functionality
- Message saving or screenshot capabilities
- Typing indicators
- Message reactions or replies
- File attachments beyond photos

## Design Considerations

- **Conversations List Screen**: Shows all active conversations with latest message preview and unread indicators
- **Chat Screen**: Standard messaging interface with input field, send button, and message bubbles
- **Message Bubbles**: Different styling for sent vs received messages, with timestamps
- **Photo Display**: Full-width photo display within message bubbles with tap to view full screen
- **Empty State**: Clear messaging when conversation has no recent messages due to expiration

## Technical Considerations

- **Real-time Engine**: Use Supabase Realtime for instant message delivery and synchronization
- **Database Schema**: Create messages table with foreign keys to users/groups and expiration timestamps
- **Message Cleanup**: Implement automated background job to delete expired messages
- **Photo Storage**: Use Supabase Storage for photo uploads with proper access controls
- **State Management**: Use Zustand for managing conversation states and message lists
- **Performance**: Implement message pagination for long conversations
- **Offline Support**: Queue messages when offline and send when connection is restored

## Success Metrics

- Messages deliver within 1 second across all devices
- Zero messages remain after 24-hour expiration period
- Conversation list loads within 2 seconds
- Photo upload and delivery completes within 10 seconds
- 99.9% message delivery success rate

## Open Questions

- Should there be a character limit for text messages?
- How should we handle message delivery failures or network issues?
- Should conversations automatically close/hide after all messages expire?
- Do we need message size limits for photos?
- Should there be any way to extend the 24-hour expiration for important messages?
- How should we handle timezone differences for the 24-hour expiration? 