# PRD: Real-time Messaging

## Introduction/Overview

The Real-time Messaging feature enables users to send and receive text messages and photos in real-time conversations with friends or within groups. Messages automatically disappear after 24 hours from send time, mimicking Snapchat's ephemeral messaging experience. The feature includes read receipts, delivery confirmations, and typing indicators to provide rich communication feedback.

## Goals

1. Enable instant text and photo messaging between friends and within groups
2. Implement automatic message disappearing after 24 hours to maintain privacy
3. Provide real-time communication feedback through status indicators
4. Create an intuitive conversation interface organized by recent activity
5. Establish secure, efficient message delivery infrastructure

## User Stories

- **As a user**, I want to send text messages to my friends so that I can communicate instantly
- **As a user**, I want to send photos in conversations so that I can share visual content
- **As a user**, I want to see when my messages are delivered and read so that I know my communication was received
- **As a user**, I want to see when someone is typing so that I know they're responding
- **As a user**, I want my messages to disappear after 24 hours so that my conversations remain private
- **As a user**, I want to see my conversations ordered by recent activity so that I can quickly access active chats
- **As a user**, I want to message friends individually or participate in group conversations
- **As a user**, I want to see message timestamps so that I can understand conversation context

## Functional Requirements

1. **Message Sending & Receiving**
   1.1. The system must allow users to send text messages to individual friends
   1.2. The system must allow users to send text messages in group conversations
   1.3. The system must allow users to send photos to individual friends and groups
   1.4. The system must deliver messages in real-time to all conversation participants
   1.5. The system must prevent messaging between non-friends
   1.6. The system must limit text messages to 500 characters maximum

2. **Message Disappearing**
   2.1. The system must automatically delete messages 24 hours after send time
   2.2. The system must delete both text and photo messages according to the same timeline
   2.3. The system must run cleanup processes to remove expired messages from storage
   2.4. The system must remove expired photos from Supabase Storage
   2.5. The system must handle unseen messages the same as seen messages for deletion timing

3. **Real-time Communication Feedback**
   3.1. The system must show delivery confirmation when messages reach the server
   3.2. The system must show read receipts when messages are viewed by recipients
   3.3. The system must display typing indicators when users are composing messages
   3.4. The system must show online/offline status of conversation participants
   3.5. The system must update message status in real-time for all participants

4. **Conversation Management**
   4.1. The system must display all conversations in a list ordered by most recent activity
   4.2. The system must show preview of the latest message in each conversation
   4.3. The system must indicate unread message count for each conversation
   4.4. The system must allow users to open individual friend conversations
   4.5. The system must allow users to open group conversations
   4.6. The system must display conversation participant information (names, profile pictures)

5. **Message Display**
   5.1. The system must show message timestamps (relative time for recent, absolute for older)
   5.2. The system must display sender information in group conversations
   5.3. The system must show message status indicators (sent, delivered, read)
   5.4. The system must display photos inline with proper sizing and loading states
   5.5. The system must support message history scrolling within the 24-hour window

## Non-Goals (Out of Scope)

- Video messages (future enhancement)
- Voice notes or audio messages  
- Message editing or deletion by users
- Message search functionality
- Message forwarding between conversations
- Message reactions or emoji responses
- File attachments beyond photos
- Message encryption (beyond standard HTTPS)

## Design Considerations

- **Conversation List**: Chat bubbles showing contact/group photo, name, latest message preview, timestamp, and unread badge
- **Chat Interface**: Standard messaging UI with text input, photo button, and send button
- **Message Bubbles**: Different styling for sent vs received messages, with status indicators
- **Photo Display**: Thumbnail in conversation, full-screen view on tap
- **Typing Indicators**: Subtle animation showing "User is typing..."
- **Status Icons**: Clear visual indicators for sent, delivered, and read states

## Technical Considerations

- Use Supabase Realtime for instant message delivery and status updates
- Store messages in PostgreSQL with automatic expiration using database jobs
- Store photos in Supabase Storage with automatic cleanup after 24 hours
- Implement efficient pagination for message history loading
- Use foreign key relationships linking messages to users and conversations
- Cache recent conversations locally for improved app startup performance
- Implement retry logic for failed message delivery
- Use database indexes for efficient conversation and message querying

## Success Metrics

- Messages are delivered within 100ms in optimal network conditions
- 95% message delivery success rate
- Typing indicators appear within 200ms of user input
- Users send an average of 20+ messages per day
- Conversation list loads within 300ms
- Photo messages are delivered within 2 seconds

## Open Questions

- Should there be a character limit indicator as users type?
- How should we handle message delivery when users are offline?
- Should we implement message retry mechanisms for failed sends?
- How should we handle photo compression for optimal performance?
- Should there be any user controls for message disappearing timing?
- How should we handle timezone differences for message timestamps? 