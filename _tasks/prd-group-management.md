# PRD: Group Management System

## Introduction/Overview

The Group Management System allows users to create, join, and manage group conversations within the app. Users can create private groups with friends or public groups that others can discover and join. The system supports administrative controls for group creators and provides search functionality for discovering public groups.

## Goals

1. Enable users to create and manage group conversations with up to 16 members
2. Implement admin privileges for group creators to maintain control over their groups
3. Support both private and public group types with appropriate discovery mechanisms
4. Provide intuitive search and filtering capabilities for group management

## User Stories

- As a user, I want to create a private group with my friends so that we can have group conversations
- As a user, I want to create a public group so that others can discover and join our community
- As a group admin, I want to add and remove members so that I can control who participates
- As a group admin, I want to change the group name so that I can keep it relevant and organized
- As a group member, I want to leave a group so that I can manage my participation
- As a user, I want to search for public groups so that I can join communities of interest
- As a user, I want to see all my groups in one place so that I can easily navigate between them

## Functional Requirements

1. **Group Creation**: Users must be able to create new groups with a name and privacy setting (public/private)
2. **Member Limit**: Groups must be limited to a maximum of 16 members including the creator
3. **Admin Privileges**: Group creators must have exclusive rights to:
   - Add new members to the group
   - Remove existing members from the group
   - Change the group name
   - Set or change the group avatar/photo
   - Delete the group entirely
4. **Member Actions**: Non-admin group members must be able to:
   - Send messages to the group
   - Share photos to the group
   - Leave the group voluntarily
5. **Group Privacy**: The system must support two group types:
   - Private groups: Only visible to members, new members can only be added by admin
   - Public groups: Discoverable in search, users can request to join
6. **Group Discovery**: Users must be able to search for public groups by name
7. **Group List**: Users must see a list of all groups they belong to, sorted alphabetically
8. **Group Search**: Users must be able to search their own groups by name
9. **Join Requests**: For public groups, non-members must be able to request to join
10. **Request Management**: Group admins must be able to approve or deny join requests for public groups
11. **Group Avatars**: Groups must display a default avatar icon when no custom avatar is set, and admins must be able to upload custom avatar photos

## Non-Goals (Out of Scope)

- Multiple admin roles or permissions
- Group categories or tags
- Group banners or cover photos
- Pinned messages or announcements
- File sharing beyond photos
- Group voice or video calls
- Group templates or cloning

## Design Considerations

- **Groups List Screen**: Alphabetically sorted list with group avatars, search bar and "Create Group" button
- **Create Group Screen**: Form with group name input, public/private toggle, and optional avatar upload
- **Group Details Screen**: Shows group avatar, members list, admin controls, and leave/join options
- **Public Groups Discovery**: Separate section in groups search showing discoverable public groups
- **Admin Indicators**: Clear visual indication of admin status and admin-only actions

## Technical Considerations

- **Database Schema**: Create groups table with relationships to users (members), admin designation, and avatar storage paths
- **Avatar Storage**: Use Supabase Storage for group avatar uploads with public access (group discoverability provides sufficient privacy)
- **Real-time Updates**: Use Supabase Realtime for live group membership changes
- **Permission System**: Implement role-based access control for admin vs member actions
- **Search Performance**: Optimize database queries for group name searches
- **State Management**: Use Zustand for managing group lists and membership states
- **Scalability**: Design schema to handle future expansion of admin roles

## Success Metrics

- Users can create a group and add members within 60 seconds
- Group search returns results within 2 seconds
- Join request response rate above 80% for public groups
- Zero unauthorized admin actions (proper permission enforcement)
- Less than 5% of groups exceed the 16-member limit due to system errors

## Open Questions

- Should there be a minimum number of members required to create a group?
- How should we handle groups when the admin leaves? Auto-promote another member or delete the group?
- Should public groups require admin approval for all join requests, or allow automatic joining?
- Do we need group descriptions for public groups to help with discovery?
- Should there be a limit on how many groups a user can create or join? 