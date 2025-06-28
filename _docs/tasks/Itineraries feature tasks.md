# Itineraries Feature - Implementation Tasks

## Database Setup

### 1. Create Database Tables
- [x] Create `activities` table with the following columns:
  - `id` (uuid, primary key)
  - `title` (text, not null)
  - `description` (text)
  - `location` (text)
  - `start_time` (timestamp)
  - `end_time` (timestamp)
  - `image_url` (text)
  - `tags` (text[])
  - `created_by` (uuid, foreign key to profiles)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
  - `itinerary_id` (uuid, foreign key to itineraries)

- [x] Create `itineraries` table with the following columns:
  - `id` (uuid, primary key)
  - `title` (text, not null)
  - `description` (text)
  - `start_time` (timestamp)
  - `end_time` (timestamp)
  - `cover_image_url` (text)
  - `weather` (json, default '[]')
  - `created_by` (uuid, foreign key to profiles)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

### 2. Set up Row Level Security (RLS)
- [x] Create RLS policy for `itineraries` table - users can view their own itineraries
- [x] Create RLS policy for `itineraries` table - users can create itineraries
- [x] Create RLS policy for `itineraries` table - users can update their own itineraries
- [x] Create RLS policy for `itineraries` table - users can delete their own itineraries
- [x] Create RLS policy for `activities` table - users can view activities from their itineraries
- [x] Create RLS policy for `activities` table - users can create activities in their itineraries
- [x] Create RLS policy for `activities` table - users can update activities in their itineraries
- [x] Create RLS policy for `activities` table - users can delete activities from their itineraries

### 3. Create Seed Data
- [x] Add 3-5 sample itineraries to `seed.sql` for different foreign countries (e.g., Japan trip, Italy vacation, Thailand adventure)
- [x] Add 5-8 activities per itinerary with varied times, locations, and tags
- [x] Ensure some activities have no start/end times to test "Not scheduled" section
- [x] Include activities spanning multiple days to test day grouping

## Frontend - Navigation Setup

### 4. Add Itineraries Tab
- [x] Add new tab icon to bottom navigation (use appropriate icon like calendar or map)
- [x] Create route configuration for `/itineraries` in app navigation
- [x] Update navigation types to include itineraries route

## Frontend - API Layer

### 5. Create Itineraries API
- [x] Create `/src/api/itineraries.ts`
- [x] Define TypeScript interfaces for `Itinerary`, `CreateItineraryData`, `UpdateItineraryData`
- [x] Implement `getItineraries()` - fetch all user's itineraries
- [x] Implement `getItinerary(id: string)` - fetch single itinerary
- [x] Implement `createItinerary(data: CreateItineraryData)` - create new itinerary
- [x] Implement `updateItinerary(id: string, data: UpdateItineraryData)` - update existing itinerary
- [x] Implement `deleteItinerary(id: string)` - delete itinerary
- [x] Implement `searchItineraries(query: string)` - search itineraries by title/description

### 6. Create Activities API
- [x] Create `/src/api/activities.ts`
- [x] Define TypeScript interfaces for `Activity`, `CreateActivityData`, `UpdateActivityData`
- [x] Implement `getActivitiesForItinerary(itineraryId: string)` - fetch all activities for an itinerary
- [x] Implement `getActivity(id: string)` - fetch single activity
- [x] Implement `createActivity(data: CreateActivityData)` - create new activity
- [x] Implement `updateActivity(id: string, data: UpdateActivityData)` - update existing activity
- [x] Implement `deleteActivity(id: string)` - delete activity

## Frontend - State Management

### 7. Create Itineraries Store
- [x] Create `/src/stores/itinerariesStore.ts` following Zustand pattern
- [x] Add state properties: `itineraries`, `isLoading`, `error`, `searchQuery`
- [x] Implement `fetchItineraries()` action using `api/itineraries`
- [x] Implement `createItinerary()` action using `api/itineraries`
- [x] Implement `updateItinerary()` action using `api/itineraries`
- [x] Implement `deleteItinerary()` action using `api/itineraries`
- [x] Implement `searchItineraries()` action using `api/itineraries`

### 8. Create Activities Store
- [x] Create `/src/stores/activitiesStore.ts` following Zustand pattern
- [x] Add state properties: `activities`, `isLoading`, `error`
- [x] Implement `fetchActivitiesForItinerary()` action using `api/activities`
- [x] Implement `createActivity()` action using `api/activities`
- [x] Implement `updateActivity()` action using `api/activities`
- [x] Implement `deleteActivity()` action using `api/activities`

## Frontend - UI Components

### 9. Create Itineraries List Screen
- [x] Create `/src/app/itineraries/index.tsx` for main itineraries tab
- [x] Add header with title "Itineraries"
- [x] Add "+ New" button in top right corner
- [x] Implement search bar component with text input
- [x] Use `useDebounce` hook from `/src/hooks/useDebounce` for search input
- [x] Connect debounced search value to store's `searchItineraries()` action

### 10. Create Itinerary Card Component
- [x] Create `/src/components/ItineraryCard.tsx`
- [x] Display cover image (or placeholder if none)
- [x] Show itinerary title
- [x] Display start and end dates formatted nicely
- [ ] Show tags (if any) as chips/badges
- [x] Add onPress handler to navigate to details

### 11. Create New/Edit Itinerary Modal
- [x] Create `/src/components/ItineraryModal.tsx` for create/edit functionality
- [x] Add form fields:
  - Title input (required, with validation)
  - Description textarea (optional)
  - Start date/time picker (optional)
  - End date/time picker (optional)
  - Cover image picker (reuse UserAvatar component logic)
- [x] Add "Save" and "Cancel" buttons
- [x] Connect to store actions for create/update
- [x] Handle loading and error states

### 12. Create Itinerary Details Screen
- [x] Create `/src/app/itineraries/[id].tsx` for detail view
- [x] Add header with itinerary title and back button
- [x] Add "+ New" button for adding activities
- [x] Fetch and display activities for the itinerary

### 13. Create Activity List Component
- [x] Create `/src/components/ActivityList.tsx`
- [x] Group activities by day based on start_time
- [x] Create day section headers (e.g., "Day 1 - Monday, Jan 15")
- [x] Sort activities chronologically within each day
- [x] Add "Not scheduled" section at bottom for activities without times
- [x] Handle empty state when no activities exist

### 14. Create Activity Card Component
- [x] Create `/src/components/ActivityCard.tsx`
- [x] Display activity image (or placeholder)
- [x] Show title and location
- [x] Display time range (if available)
- [x] Show description preview (truncated)
- [x] Display tags as small chips
- [x] Add onPress handler to open edit modal

### 15. Create New/Edit Activity Modal
- [x] Create `/src/components/ActivityModal.tsx` for create/edit functionality
- [x] Add form fields:
  - Title input (required, with validation)
  - Description textarea (optional)
  - Location input (optional)
  - Start date/time picker (optional)
  - End date/time picker (optional)
  - Image picker (reuse UserAvatar component logic)
  - Tags input (semicolon-separated text, optional)
- [x] Add "Save" and "Cancel" buttons
- [x] Connect to store actions for create/update
- [x] Handle loading and error states

## Frontend - Utilities

### 16. Create Date/Time Utilities
- [x] Create `/src/utils/dateHelpers.ts`
- [x] Add function to group activities by day
- [x] Add function to format date ranges nicely
- [x] Add function to calculate day numbers (Day 1, Day 2, etc.)
- [x] Add function to format time ranges

### 17. Create Image Upload Utilities
- [x] Extend existing image upload logic to support itinerary/activity images
- [x] Add functions to upload to appropriate Supabase storage buckets
- [x] Handle image URL generation and storage

## Testing

### 18. Write Unit Tests
- [ ] Test itineraries store actions
- [ ] Test activities store actions
- [ ] Test date grouping utility functions
- [ ] Test search filtering logic

### 19. Write Component Tests
- [ ] Test ItineraryCard rendering with different props
- [ ] Test ActivityCard rendering with/without times
- [ ] Test modal forms validation
- [ ] Test navigation between screens

## Error Handling & Edge Cases

### 20. Handle Edge Cases
- [ ] Handle offline state gracefully
- [ ] Add proper error messages for failed operations
- [ ] Handle activities spanning multiple days
- [ ] Handle timezone considerations
- [ ] Add confirmation dialogs for delete operations

## Performance Optimization

### 21. Optimize List Performance
- [ ] Implement FlatList for itineraries list
- [ ] Implement SectionList for activities grouped by day
- [ ] Add proper keyExtractor functions
- [ ] Implement lazy loading if lists become large

## Final Polish

### 22. UI/UX Refinements
- [ ] Add loading skeletons while data fetches
- [ ] Add pull-to-refresh on lists
- [ ] Add empty states with helpful messages
- [ ] Ensure consistent styling with rest of app