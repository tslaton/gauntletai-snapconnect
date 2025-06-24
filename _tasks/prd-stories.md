# PRD: Stories

## Introduction/Overview

The Stories feature allows users to post photo series with optional caption overlays that remain visible to their friends for 24 hours. Friends can view these stories in a fullscreen carousel format, creating a temporary content sharing experience similar to Snapchat and Instagram Stories. Users can control story privacy settings to determine who can view their content.

## Goals

1. Enable users to share temporary photo content that disappears after 24 hours
2. Provide a fullscreen, immersive viewing experience for story content
3. Implement flexible privacy controls for story visibility
4. Create an engaging carousel interface for viewing multiple story photos
5. Establish the foundation for ephemeral content sharing in the app

## User Stories

- **As a user**, I want to post photos to my story so that I can share moments with my friends temporarily
- **As a user**, I want to add captions to my story photos so that I can provide context or commentary
- **As a user**, I want to control who can see my stories so that I can manage my privacy
- **As a user**, I want to view my friends' stories in fullscreen so that I can see their content clearly
- **As a user**, I want to swipe through multiple photos in a story so that I can see the complete narrative
- **As a user**, I want to see when my friends post new stories so that I don't miss their content
- **As a user**, I want my stories to disappear after 24 hours so that my content doesn't accumulate permanently

## Functional Requirements

1. **Story Creation**
   1.1. The system must allow users to post photos to their story
   1.2. The system must support posting multiple photos to create a story series
   1.3. The system must allow users to add optional text captions to story photos
   1.4. The system must allow users to set privacy levels (all friends, close friends, public)
   1.5. The system must automatically timestamp stories for 24-hour expiration
   1.6. The system must allow users to delete their own stories before expiration

2. **Story Privacy Controls**
   2.1. The system must offer "All Friends" privacy setting to share with all friends
   2.2. The system must offer "Close Friends" privacy setting for a selected subset of friends
   2.3. The system must offer "Public" privacy setting for non-friend visibility (if user chooses)
   2.4. The system must allow users to select close friends list for restricted sharing
   2.5. The system must enforce privacy settings so only authorized users can view stories

3. **Story Viewing**
   3.1. The system must display stories in fullscreen carousel format
   3.2. The system must allow users to swipe left/right to navigate between photos in a story
   3.3. The system must allow users to tap to advance to the next story or photo
   3.4. The system must show progress indicators for multi-photo stories
   3.5. The system must display captions overlaid on story photos
   3.6. The system must show story timestamp and author information

4. **Story Discovery**
   4.1. The system must display available stories in a horizontal list on the main screen
   4.2. The system must show profile pictures with colored rings to indicate new/unseen stories
   4.3. The system must order stories by recency (most recent first)
   4.4. The system must differentiate between seen and unseen stories visually
   4.5. The system must show user's own story first in the list

5. **Story Management**
   5.1. The system must automatically delete stories after 24 hours from posting time
   5.2. The system must remove expired story photos from storage
   5.3. The system must allow users to view their own posted stories
   5.4. The system must track which users have viewed each story (for future features)
   5.5. The system must handle story expiration gracefully during viewing

## Non-Goals (Out of Scope)

- Story reactions or responses (hearts, emojis)
- Story view notifications ("X viewed your story")
- Story highlights or saving stories permanently
- Video stories (future enhancement)
- Story sharing or forwarding between users
- Interactive story elements (polls, questions)
- Story archives or story history beyond 24 hours

## Design Considerations

- **Stories List**: Horizontal scrolling row of circular profile pictures with colored rings for new stories
- **Story Viewer**: Fullscreen interface with photo, caption overlay, progress bars, and navigation
- **Caption Overlay**: Text positioned over photos with readable styling and background
- **Progress Indicators**: Multiple small bars at top showing position in story series
- **Navigation**: Tap zones for forward/back, swipe gestures for story navigation
- **Privacy UI**: Clear indicators during story creation for privacy level selection

## Technical Considerations

- Store stories in PostgreSQL with automatic expiration using database jobs
- Use Supabase Storage for story photos with automatic cleanup after 24 hours
- Implement efficient loading and caching for story media content
- Use proper indexing for story queries sorted by recency
- Optimize image loading and display for fullscreen viewing
- Handle story expiration gracefully with proper error handling
- Cache story view states locally to track seen/unseen status
- Implement pagination for story lists as user networks grow

## Success Metrics

- 60% of users post their first story within one week of joining
- Users view an average of 10+ stories per day
- Stories load and display within 1 second
- Story navigation (swipe/tap) responds within 200ms
- 80% of posted stories are viewed by at least one friend
- Users post an average of 3 photos per story

## Open Questions

- Should there be a maximum number of photos allowed per story?
- How should we handle story viewing when the user loses internet connection?
- Should story captions have character limits?
- Should users be able to see who viewed their stories in the MVP?
- How should we handle concurrent story viewing by multiple users?
- Should there be any audio or sound effects for story transitions? 