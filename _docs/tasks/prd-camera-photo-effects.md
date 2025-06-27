# PRD: Camera and Photo Effects

## Introduction/Overview

The Camera and Photo Effects feature enables users to capture photos directly within the app using either front or back camera, apply simple Gaussian blur effects in real-time preview, and share the enhanced photos immediately in conversations or stories. This feature provides a seamless photo capture and editing experience without requiring users to leave the app.

## Goals

1. Provide in-app camera functionality for direct photo capture
2. Implement real-time effect preview with simple Gaussian blur
3. Enable post-capture effect application and adjustment
4. Seamlessly integrate with messaging and stories features for immediate sharing

## User Stories

- As a user, I want to take photos with my phone's camera without leaving the app so that I can quickly share moments
- As a user, I want to switch between front and back cameras so that I can take selfies or regular photos
- As a user, I want to see effect previews in real-time so that I can see how my photo will look before taking it
- As a user, I want to apply or adjust effects after taking a photo so that I can fine-tune the result
- As a user, I want to share my edited photos immediately so that I can quickly send them to friends or add to stories

## Functional Requirements

1. **Camera Access**: The app must request and utilize device camera permissions for both front and back cameras
2. **Camera Switching**: Users must be able to toggle between front and back cameras with a single tap
3. **Photo Capture**: Users must be able to capture full-resolution photos using the device camera
4. **Real-time Preview**: The camera preview must show the Gaussian blur effect applied in real-time when enabled
5. **Effect Toggle**: Users must be able to enable/disable the Gaussian blur effect during preview
6. **Post-Capture Editing**: After taking a photo, users must be able to apply or remove the Gaussian blur effect
7. **Effect Intensity**: Users must be able to adjust the intensity of the Gaussian blur effect with a simple slider control
8. **Photo Quality**: Photos must be captured at the device's native camera resolution without compression during editing
9. **Share Integration**: Edited photos must be immediately shareable to conversations or stories without additional steps
10. **Cancel Option**: Users must be able to discard photos and return to camera without saving

## Non-Goals (Out of Scope)

- Multiple effect types (filters, color adjustments, etc.)
- Saving photos to device gallery
- Advanced editing tools (crop, rotate, text overlay)
- Video recording capabilities
- Flash or lighting controls
- Manual camera settings (ISO, exposure, etc.)
- Photo editing of existing gallery images

## Design Considerations

- **Camera Screen**: Full-screen camera preview with minimal UI overlay
- **Control Placement**: Camera switch button, effect toggle, and capture button positioned for easy thumb access
- **Effect Controls**: Simple slider for blur intensity, positioned prominently but not obstructing preview
- **Preview Overlay**: Real-time effect preview should be smooth and responsive (30+ FPS)
- **Post-Capture Screen**: Split view showing original and edited versions with apply/cancel options

## Technical Considerations

- **Camera Library**: Use Expo Camera API for cross-platform camera access and control
- **Image Processing**: Implement Gaussian blur using efficient image processing libraries (e.g., react-native-image-filter-kit)
- **Performance**: Ensure real-time preview maintains smooth frame rate on target devices
- **Memory Management**: Properly dispose of camera resources and processed images to prevent memory leaks
- **Permissions**: Handle camera permission requests gracefully with appropriate fallbacks
- **State Management**: Use Zustand for managing camera state, effects, and captured photos
- **File Handling**: Efficiently process and store captured images for immediate sharing

## Success Metrics

- Camera opens within 2 seconds of user request
- Real-time effect preview maintains 30+ FPS on target devices
- Photo capture and effect processing completes within 3 seconds
- 99% success rate for camera permission requests (excluding user denials)
- Zero memory leaks during extended camera usage sessions

## Open Questions

- Should there be a minimum/maximum blur intensity range?
- Do we need a thumbnail preview of the last captured photo for quick access?
- Should effects be persisted as user preferences between sessions?
- How should we handle devices with multiple back cameras (ultra-wide, telephoto)?
- Should there be any visual feedback during photo processing?
- Do we need different blur algorithms optimized for different device performance levels? 