# PRD: Friend Management

## Introduction/Overview

The Friend Management feature enables users to discover, connect with, and manage their social network within the Snapchat clone app. Users can search for friends by username or phone contacts, send friend requests, and organize their friends list for easy access. This feature forms the foundation of the social connectivity that enables messaging, groups, and stories functionality.

## Goals

1. Enable users to find and connect with other users through username search and phone contacts
2. Implement a mutual consent friend request system for secure social connections
3. Provide an organized, searchable friends list that helps users quickly find specific friends
4. Create the foundational relationship data structure that supports messaging and stories features

## User Stories

- **As a new user**, I want to search for friends by username so that I can connect with people I know who are already using the app
- **As a user**, I want to import my phone contacts to find friends so that I can quickly build my social network
- **As a user**, I want to send friend requests so that I can connect with people who must also agree to be friends
- **As a user**, I want to accept or decline friend requests so that I control who I'm connected with
- **As a user**, I want to see my friends organized by online status and activity so that I can easily find who to message
- **As a user**, I want to search through my friends list so that I can quickly find a specific friend
- **As a user**, I want to remove friends so that I can manage my social connections

## Functional Requirements

1. **Friend Discovery**
   1.1. The system must provide a username search function that returns matching user profiles
   1.2. The system must allow users to import and search their phone contacts to find existing app users
   1.3. The system must display user profiles with username, display name, and profile picture in search results

2. **Friend Request System**
   2.1. The system must allow users to send friend requests to other users
   2.2. The system must prevent duplicate friend requests between the same users
   2.3. The system must notify users when they receive friend requests
   2.4. The system must allow users to accept, decline, or ignore friend requests
   2.5. The system must establish mutual friendship only after both users have accepted
   2.6. The system must prevent users from sending messages or viewing stories of non-friends

3. **Friends List Management**
   3.1. The system must display friends in two sections: online friends and all friends
   3.2. Online friends must be sorted by recent activity (most recent first)
   3.3. All friends section must be sorted alphabetically by display name
   3.4. The system must provide a search function within the friends list
   3.5. The system must allow users to remove friends with confirmation
   3.6. The system must show friend status indicators (online, offline, last seen)

4. **Friend Request Management**
   4.1. The system must display pending sent requests in a separate section
   4.2. The system must display incoming friend requests with accept/decline options
   4.3. The system must allow users to cancel sent friend requests

## Non-Goals (Out of Scope)

- User blocking functionality
- Privacy controls for friend request restrictions
- QR code friend discovery
- Nearby users discovery
- Close friends categorization
- Friend suggestions or recommendations

## Design Considerations

- **Friends List UI**: Two-section layout with clear visual separation between online and offline friends
- **Search Interface**: Global search for new users and local search within friends list
- **Friend Requests**: Badge notifications for pending requests, clear accept/decline buttons
- **Profile Display**: Consistent user profile cards across search results and friends list
- **Status Indicators**: Green dot for online, timestamp for last seen

## Technical Considerations

- Integrate with existing Supabase Auth for user authentication
- Use Supabase Realtime for online status updates
- Store friend relationships in PostgreSQL with proper indexing for search performance
- Implement phone contact access using Expo Contacts API
- Cache friends list data locally for improved performance
- Use proper foreign key relationships between users and friendships tables

## Success Metrics

- Users successfully add at least 5 friends within their first week
- Friend search returns results within 500ms
- 90% of friend requests result in accepted friendships
- Users access their friends list at least 3 times per day on average

## Open Questions

- Should there be a limit on the number of friends a user can have?
- How should we handle username uniqueness and display names?
- Should friend activity status be real-time or cached with periodic updates?
- How should we handle phone contact privacy and permissions requests? 