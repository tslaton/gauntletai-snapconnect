# Itineraries Feature - Implementation Tasks

## Database Setup

### 1. Create Database Tables
- [ ] Create `activities` table with the following columns:
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

- [ ] Create `itineraries` table with the following columns:
  - `id` (uuid, primary key)
  - `title` (text, not null)
  - `description` (text)
  - `start_time` (timestamp)
  - `end_time` (timestamp)
  - `cover_image_url` (text)
  - `weather` (jsonb, default '[]')
  - `created_by` (uuid, foreign key to profiles)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

### 2. Set up Row Level Security (RLS)
- [ ] Create RLS policy for `itineraries` table - users can view their own itineraries
- [ ] Create RLS policy for `itineraries` table - users can create itineraries
- [ ] Create RLS policy for `itineraries` table - users can update their own itineraries
- [ ] Create RLS policy for `itineraries` table - users can delete their own itineraries
- [ ] Create RLS policy for `activities` table - users can view activities from their itineraries
- [ ] Create RLS policy for `activities` table - users can create activities in their itineraries
- [ ] Create RLS policy for `activities` table - users can update activities in their itineraries
- [ ] Create RLS policy for `activities` table - users can delete activities from their itineraries

### 3. Create Seed Data
- [ ] Add 3-5 sample itineraries to `seed.sql` for different foreign countries (e.g., Japan trip, Italy vacation, Thailand adventure)
- [ ] Add 5-8 activities per itinerary with varied times, locations, and tags
- [ ] Ensure some activities have no start/end times to test "Not scheduled" section
- [ ] Include activities spanning multiple days to test day grouping

## Frontend - Navigation Setup

### 4. Add Itineraries Tab
- [ ] Add new tab icon to bottom navigation (use appropriate icon like calendar or map)
- [ ] Create route configuration for `/itineraries` in app navigation
- [ ] Update navigation types to include itineraries route

## Frontend - API Layer

### 5. Create Itineraries API
- [ ] Create `/src/api/itineraries.ts`
- [ ] Define TypeScript interfaces for `Itinerary`, `CreateItineraryData`, `UpdateItineraryData`
- [ ] Implement `getItineraries()` - fetch all user's itineraries
- [ ] Implement `getItinerary(id: string)` - fetch single itinerary
- [ ] Implement `createItinerary(data: CreateItineraryData)` - create new itinerary
- [ ] Implement `updateItinerary(id: string, data: UpdateItineraryData)` - update existing itinerary
- [ ] Implement `deleteItinerary(id: string)` - delete itinerary
- [ ] Implement `searchItineraries(query: string)` - search itineraries by title/description

### 6. Create Activities API
- [ ] Create `/src/api/activities.ts`
- [ ] Define TypeScript interfaces for `Activity`, `CreateActivityData`, `UpdateActivityData`
- [ ] Implement `getActivitiesForItinerary(itineraryId: string)` - fetch all activities for an itinerary
- [ ] Implement `getActivity(id: string)` - fetch single activity
- [ ] Implement `createActivity(data: CreateActivityData)` - create new activity
- [ ] Implement `updateActivity(id: string, data: UpdateActivityData)` - update existing activity
- [ ] Implement `deleteActivity(id: string)` - delete activity

## Frontend - State Management

### 7. Create Itineraries Store
- [ ] Create `/src/stores/itinerariesStore.ts` following Zustand pattern
- [ ] Add state properties: `itineraries`, `isLoading`, `error`, `searchQuery`
- [ ] Implement `fetchItineraries()` action using `api/itineraries`
- [ ] Implement `createItinerary()` action using `api/itineraries`
- [ ] Implement `updateItinerary()` action using `api/itineraries`
- [ ] Implement `deleteItinerary()` action using `api/itineraries`
- [ ] Implement `searchItineraries()` action using `api/itineraries`

### 8. Create Activities Store
- [ ] Create `/src/stores/activitiesStore.ts` following Zustand pattern
- [ ] Add state properties: `activities`, `isLoading`, `error`
- [ ] Implement `fetchActivitiesForItinerary()` action using `api/activities`
- [ ] Implement `createActivity()` action using `api/activities`
- [ ] Implement `updateActivity()` action using `api/activities`
- [ ] Implement `deleteActivity()` action using `api/activities`

## Frontend - UI Components

### 9. Create Itineraries List Screen
- [ ] Create `/src/app/itineraries/index.tsx` for main itineraries tab
- [ ] Add header with title "Itineraries"
- [ ] Add "+ New" button in top right corner
- [ ] Implement search bar component with text input
- [ ] Use `useDebounce` hook from `/src/hooks/useDebounce` for search input
- [ ] Connect debounced search value to store's `searchItineraries()` action

### 10. Create Itinerary Card Component
- [ ] Create `/src/components/ItineraryCard.tsx`
- [ ] Display cover image (or placeholder if none)
- [ ] Show itinerary title
- [ ] Display start and end dates formatted nicely
- [ ] Show tags (if any) as chips/badges
- [ ] Add onPress handler to navigate to details

### 11. Create New/Edit Itinerary Modal
- [ ] Create `/src/components/ItineraryModal.tsx` for create/edit functionality
- [ ] Add form fields:
  - Title input (required, with validation)
  - Description textarea (optional)
  - Start date/time picker (optional)
  - End date/time picker (optional)
  - Cover image picker (reuse UserAvatar component logic)
- [ ] Add "Save" and "Cancel" buttons
- [ ] Connect to store actions for create/update
- [ ] Handle loading and error states

### 12. Create Itinerary Details Screen
- [ ] Create `/src/app/itineraries/[id].tsx` for detail view
- [ ] Add header with itinerary title and back button
- [ ] Add "+ New" button for adding activities
- [ ] Fetch and display activities for the itinerary

### 13. Create Activity List Component
- [ ] Create `/src/components/ActivityList.tsx`
- [ ] Group activities by day based on start_time
- [ ] Create day section headers (e.g., "Day 1 - Monday, Jan 15")
- [ ] Sort activities chronologically within each day
- [ ] Add "Not scheduled" section at bottom for activities without times
- [ ] Handle empty state when no activities exist

### 14. Create Activity Card Component
- [ ] Create `/src/components/ActivityCard.tsx`
- [ ] Display activity image (or placeholder)
- [ ] Show title and location
- [ ] Display time range (if available)
- [ ] Show description preview (truncated)
- [ ] Display tags as small chips
- [ ] Add onPress handler to open edit modal

### 15. Create New/Edit Activity Modal
- [ ] Create `/src/components/ActivityModal.tsx` for create/edit functionality
- [ ] Add form fields:
  - Title input (required, with validation)
  - Description textarea (optional)
  - Location input (optional)
  - Start date/time picker (optional)
  - End date/time picker (optional)
  - Image picker (reuse UserAvatar component logic)
  - Tags input (semicolon-separated text, optional)
- [ ] Add "Save" and "Cancel" buttons
- [ ] Connect to store actions for create/update
- [ ] Handle loading and error states

## Frontend - Utilities

### 16. Create Date/Time Utilities
- [ ] Create `/src/utils/dateHelpers.ts`
- [ ] Add function to group activities by day
- [ ] Add function to format date ranges nicely
- [ ] Add function to calculate day numbers (Day 1, Day 2, etc.)
- [ ] Add function to format time ranges

### 17. Create Image Upload Utilities
- [ ] Extend existing image upload logic to support itinerary/activity images
- [ ] Add functions to upload to appropriate Supabase storage buckets
- [ ] Handle image URL generation and storage

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