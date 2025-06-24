# PRD: Camera & Photo Effects

## Introduction/Overview

The Camera & Photo Effects feature enables users to capture photos using their device's front or back camera directly within the app and apply simple visual effects before sharing. Users can preview effects in real-time while taking photos and also apply effects after capture. This feature includes text overlays and emoji additions to enhance photo content for messaging and stories.

## Goals

1. Enable in-app photo capture using front and back cameras
2. Provide simple photo effects that can be applied in real-time and post-capture
3. Allow users to add text overlays and emojis to photos
4. Create an intuitive camera interface optimized for mobile use
5. Store original quality photos for messaging and stories features

## User Stories

- **As a user**, I want to take photos using the app's camera so that I can share content without leaving the app
- **As a user**, I want to switch between front and back cameras so that I can take selfies or capture my surroundings
- **As a user**, I want to see effects applied in real-time while taking photos so that I can preview the result
- **As a user**, I want to apply effects to photos after taking them so that I can experiment with different looks
- **As a user**, I want to add text to my photos so that I can include captions or comments
- **As a user**, I want to add emojis to my photos so that I can express emotions visually
- **As a user**, I want to save or share my edited photos so that I can use them in messages or stories

## Functional Requirements

1. **Camera Functionality**
   1.1. The system must provide access to the device's front and back cameras
   1.2. The system must allow users to switch between front and back cameras with a single tap
   1.3. The system must display a live camera preview in full-screen mode
   1.4. The system must provide a capture button to take photos
   1.5. The system must handle camera permissions appropriately
   1.6. The system must work in both portrait and landscape orientations

2. **Photo Effects**
   2.1. The system must offer at least one simple blur effect that can be applied to photos
   2.2. The system must allow users to preview effects in real-time during camera capture
   2.3. The system must allow users to apply effects to photos after capture
   2.4. The system must provide an effects selection interface with visual previews
   2.5. The system must allow users to adjust effect intensity (if applicable)
   2.6. The system must maintain original photo quality when effects are applied

3. **Text Overlays**
   3.1. The system must allow users to add text overlays to photos
   3.2. The system must provide a text input interface for typing captions
   3.3. The system must allow users to position text anywhere on the photo
   3.4. The system must offer basic text styling options (color, size)
   3.5. The system must allow users to edit or delete text overlays
   3.6. The system must ensure text is readable with appropriate contrast

4. **Emoji Support**
   4.1. The system must provide an emoji picker interface
   4.2. The system must allow users to place emojis anywhere on photos
   4.3. The system must allow users to resize and rotate emojis
   4.4. The system must support multiple emojis on a single photo
   4.5. The system must allow users to move and delete placed emojis

5. **Photo Management**
   5.1. The system must save original photo quality to device storage temporarily
   5.2. The system must generate final edited photos with applied effects and overlays
   5.3. The system must provide options to use photos in messages or stories
   5.4. The system must allow users to discard photos without saving
   5.5. The system must handle photo orientation correctly

## Non-Goals (Out of Scope)

- Advanced photo editing tools (crop, rotate, adjust brightness/contrast)
- Video recording capabilities
- Photo filters beyond simple blur effects
- Drawing or sketching tools on photos
- Photo import from device gallery
- Multiple photo capture (burst mode)
- Photo quality settings or resolution options

## Design Considerations

- **Camera Interface**: Full-screen camera view with minimal UI overlay (capture button, camera switch, effects toggle)
- **Effects Panel**: Bottom drawer or sidebar with effect previews and intensity sliders
- **Text Editor**: Simple text input with font size and color selectors
- **Emoji Picker**: Standard emoji grid interface with search/categories
- **Photo Editor**: Clean interface showing photo with overlay editing tools
- **Navigation**: Clear save/discard options and easy transition to sharing

## Technical Considerations

- Use Expo Camera API for camera access and photo capture
- Implement effects using Expo GL or native image processing libraries
- Store photos temporarily in Expo FileSystem before processing
- Use Expo ImageManipulator for applying effects and overlays
- Handle camera permissions with proper error states and prompts
- Optimize photo processing for performance on lower-end devices
- Implement proper memory management for photo handling
- Use Expo MediaLibrary for saving photos if user chooses to save locally

## Success Metrics

- 90% of users successfully take their first photo within the app
- Camera loads and is ready to capture within 2 seconds
- Effect application completes within 1 second for simple effects
- 70% of captured photos include at least one effect, text, or emoji
- Photo processing and editing interface responds within 500ms to user actions
- Less than 5% of photo captures result in errors or crashes

## Open Questions

- Should we include a flash toggle for back camera photos?
- How many different effects should be available for MVP?
- Should there be preset text styles or just basic formatting?
- Should users be able to save photos to their device gallery?
- How should we handle photos taken in low light conditions?
- Should there be a timer function for self-portraits? 