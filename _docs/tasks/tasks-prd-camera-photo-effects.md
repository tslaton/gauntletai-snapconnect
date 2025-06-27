# Tasks: Camera and Photo Effects Implementation

## Relevant Files

- `src/app/camera/index.tsx` - Main camera screen with preview and controls
- `src/app/camera/edit.tsx` - Post-capture photo editing screen with effect controls
- `src/components/Camera/CameraView.tsx` - Core camera component with preview functionality
- `src/components/Camera/CameraControls.tsx` - Camera control buttons (capture, switch, effects)
- `src/components/Camera/EffectSlider.tsx` - Blur intensity adjustment slider component
- `src/components/Camera/CameraPermissions.tsx` - Camera permission request and handling component
- `src/stores/camera.ts` - Zustand store for camera state management
- `src/utils/cameraApi.ts` - Camera utility functions and API wrapper
- `src/utils/imageProcessing.ts` - Image processing utilities for Gaussian blur effects
- `src/utils/permissions.ts` - Permission handling utilities
- `src/utils/photoStorage.ts` - Photo storage utilities for Supabase Storage upload/download
- `src/utils/cameraErrors.ts` - Camera error handling utilities
- `src/types/camera.ts` - TypeScript types for camera functionality
- `src/components/MessageBubble.tsx` - Updated to display photo messages
- `__tests__/components/Camera/CameraView.test.tsx` - Unit tests for CameraView component
- `__tests__/components/Camera/CameraControls.test.tsx` - Unit tests for CameraControls component
- `__tests__/stores/camera.test.ts` - Unit tests for camera store
- `__tests__/utils/imageProcessing.test.ts` - Unit tests for image processing utilities

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [x] 1.0 Camera Setup and Permissions Management
  - [x] 1.1 Install and configure Expo Camera dependencies (`expo-camera`, `expo-image-picker`)
  - [x] 1.2 Create camera permissions utility functions in `src/utils/permissions.ts`
  - [x] 1.3 Implement camera permission request flow with user-friendly messaging
  - [x] 1.4 Create `CameraPermissions` component to handle permission states and requests
  - [x] 1.5 Add camera permission configuration to `app.json` for iOS and Android
  - [x] 1.6 Create error handling for camera access denied scenarios

- [x] 2.0 Camera Interface and Controls Implementation
  - [x] 2.1 Create main camera screen at `src/app/camera/index.tsx` with navigation setup
  - [x] 2.2 Implement `CameraView` component with Expo Camera integration
  - [x] 2.3 Create `CameraControls` component with capture button and camera switch functionality
  - [x] 2.4 Add camera preview with proper aspect ratio and orientation handling
  - [x] 2.5 Implement camera mounting/unmounting lifecycle management
  - [x] 2.6 Style camera interface with NativeWind for modern, responsive design

- [ ] 3.0 Real-time Effect Processing System
  - [ ] 3.1 Install image processing dependencies (`react-native-image-filter-kit` or equivalent)
  - [ ] 3.2 Create `imageProcessing.ts` utility with Gaussian blur implementation
  - [ ] 3.3 Implement real-time effect preview overlay on camera preview
  - [ ] 3.4 Create effect toggle button in camera controls
  - [ ] 3.5 Optimize effect processing for 30+ FPS performance on target devices
  - [ ] 3.6 Add loading states and performance monitoring for effect processing
  - [ ] 3.7 Implement effect intensity preview with live adjustment

- [x] 4.0 Photo Capture and Post-Processing Pipeline
  - [x] 4.1 Implement photo capture functionality with full resolution support
  - [x] 4.2 Create post-capture editing screen at `src/app/camera/edit.tsx`
  - [ ] 4.3 Build `EffectSlider` component for blur intensity adjustment
  - [ ] 4.4 Implement split-view comparison (original vs. edited) in post-capture screen
  - [ ] 4.5 Add apply/cancel workflow with proper state management
  - [ ] 4.6 Handle image quality preservation during effect processing
  - [ ] 4.7 Implement memory management for captured and processed images
  - [ ] 4.8 Add photo processing progress indicators and error handling

- [ ] 5.0 Integration with Sharing and Stories Systems
  - [x] 5.1 Update existing messaging components to accept camera-captured photos
  - [ ] 5.2 Integrate camera photos with stories system for immediate sharing
  - [x] 5.3 Create sharing flow from post-capture edit screen
  - [x] 5.4 Update navigation to include camera access from chat and stories screens
  - [x] 5.5 Ensure captured photos work with existing Supabase storage integration
  - [x] 5.6 Add camera state management to Zustand store with proper cleanup 