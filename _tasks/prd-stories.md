# PRD: Stories Feature

## Introduction/Overview

The Stories feature allows users to share photo collections that are visible to their network for 24 hours before automatically disappearing. Users can create stories with up to 10 photos, add text captions with default styling, and control who can view their content. Viewers can navigate through story carousels and react with emojis to express engagement.

## Goals

1. Enable users to share ephemeral photo collections with their network
2. Provide an engaging carousel viewing experience for consuming stories
3. Implement privacy controls for story visibility (friends vs. public)
4. Support social interaction through emoji reactions
5. Ensure automatic content expiration after 24 hours

## User Stories

- As a user, I want to create stories with multiple photos so that I can share a sequence of moments
- As a user, I want to add captions to my story photos so that I can provide context or commentary
- As a user, I want to control who sees my stories so that I can manage my privacy
- As a user, I want to view my friends' stories so that I can stay connected with their experiences
- As a user, I want to react to stories with emojis so that I can engage with content I enjoy
- As a user, I want my stories to disappear automatically so that they remain ephemeral

## Functional Requirements

1. **Story Creation**: Users must be able to create new stories by selecting up to 10 photos
2. **Photo Sources**: Users must be able to add photos from both camera capture and existing stories
3. **Caption Addition**: Users must be able to add text captions to individual photos in their story
4. **Privacy Settings**: Users must be able to set story visibility to either "All Friends" or "Public"
5. **Story Publishing**: Users must be able to publish their complete story for others to view
6. **Story Discovery**: Users must see stories from friends and public stories they can access
7. **Carousel Navigation**: Viewers must be able to swipe through story photos in sequential order
8. **Fullscreen Display**: Story photos must be displayed in fullscreen format during viewing
9. **Emoji Reactions**: Viewers must be able to react to individual story photos with emoji
10. **Reaction Display**: Story creators must be able to see who reacted to their stories and with which emojis
11. **Auto-Expiration**: Stories must automatically disappear after exactly 24 hours from creation
12. **Story Indicators**: The interface must show which friends have new stories available to view

## Non-Goals (Out of Scope)

- Video content in stories
- Custom caption fonts, colors, or positioning
- Story templates or backgrounds
- Music or audio overlays
- Story highlights or saving
- Advanced privacy controls (close friends lists, etc.)
- Story analytics or view counts
- Collaborative stories

## Design Considerations

- **Stories Feed**: Horizontal scrollable list of friend profiles with story indicators
- **Story Viewer**: Fullscreen immersive experience with minimal UI overlay
- **Progress Indicators**: Top bar showing progress through story photos
- **Caption Overlay**: Text captions positioned consistently on photos with readable styling
- **Reaction Interface**: Simple emoji picker accessible via tap/long press
- **Creation Flow**: Intuitive multi-step process for photo selection, captioning, and publishing

## Technical Considerations

- **Database Schema**: Create stories table with relationships to photos, users, and reactions
- **Photo Storage**: Use Supabase Storage with appropriate access controls for story photos
- **Real-time Updates**: Use Supabase Realtime for live reaction notifications
- **Background Jobs**: Implement automated cleanup for expired stories and associated media
- **State Management**: Use Zustand for managing story states, viewing progress, and reactions
- **Image Optimization**: Ensure story photos load quickly and display smoothly in carousel
- **Gesture Handling**: Implement smooth swipe gestures for story navigation

## Success Metrics

- Stories creation flow completed in under 2 minutes
- Story photos load within 3 seconds during viewing
- Zero stories remain visible after 24-hour expiration
- Emoji reaction registration happens within 1 second
- 90% of users who start creating a story complete and publish it

## Open Questions

- Should there be a maximum caption length for story photos?
- How should we handle stories when users become unfriended during the 24-hour period?
- Should users be able to delete their own stories before the 24-hour expiration?
- Do we need to show reaction counts or just the reactions themselves?
- Should there be default emoji options or a full emoji picker?
- How should we handle timezone differences for the 24-hour expiration?
- Should users receive notifications when someone reacts to their stories? 