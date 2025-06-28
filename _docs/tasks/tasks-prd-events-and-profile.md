## Relevant Files

- `supabase/migrations/0002_create_events_and_interests.sql` - Creates `events` and `user_interests` tables; adds new columns to `profiles`.
- `supabase/migrations/0003_rls_policies.sql` - Row-Level Security policies for `events` and `user_interests`.
- `_scripts/seed-dev-data.sh` - Inserts 20 sample events for local development.
- `src/api/events.ts` - Client functions to fetch and search events from Supabase. ✅
- `src/stores/events.ts` - Zustand store managing events list and search state. ✅
- `src/app/(tabs)/events.tsx` - Events tab screen displaying list and search input. ✅
- `src/components/EventCard.tsx` - Reusable card component for event list items. ✅
- `src/app/events/[eventId].tsx` - Event detail screen. ✅
- `src/app/onboarding/(stack)/Personality.tsx` - Onboarding screen collecting personality description.
- `src/app/onboarding/(stack)/CurrentActivities.tsx` - Onboarding screen collecting current activities.
- `src/app/onboarding/(stack)/DesiredActivities.tsx` - Onboarding screen collecting desired activities.
- `src/api/userInterests.ts` - CRUD helpers for `user_interests` and profile fields.
- `src/app/profile/edit.tsx` - Edit Profile screen allowing updates to personality and interests.
- `src/app/server/dev/refine-user-inputs+api.ts` - Edge function calling OpenAI for suggestions.
- `src/hooks/useDebounce.ts` - Debounce hook used for suggestion requests. ✅
- `src/components/UserCard.tsx` - Reusable user card displaying personality and interests.
- `src/utils/relativeTime.ts` - Utility to format start times (e.g., "in 3 h"). ✅
- `tests/events.test.ts` - Test API functions and store logic.
- `src/components/__tests__/EventCard.test.tsx` - Unit tests for EventCard component.
- `src/components/__tests__/UserCard.test.tsx` - Unit tests for UserCard component.
- `src/app/server/dev/__tests__/refine-user-inputs.test.ts` - Unit tests for edge function (mocked OpenAI).

### Notes

- Keep unit tests alongside the modules they test when practical.
- Use `npx jest` to run the full test suite or pass a specific path to target a file.
- Follow existing eslint and prettier rules; new files should be < 500 lines.

## Tasks

- [x] 1.0 Database Migrations & Seed Scripts
  - [x] 1.1 Create migration `0002_create_events_and_interests.sql` defining `events` table and `user_interests` table; alter `profiles` with `personality_description` & `about` columns.
  - [x] 1.2 Write migration `0003_rls_policies.sql` enabling SELECT on `events` and INSERT/UPDATE/SELECT on `user_interests` for authenticated users.
  - [x] 1.3 Update `_scripts/seed-dev-data.sh` to insert 20 events with future start times, images, tags.
  - [x] 1.4 Run migrations and seed script locally; verify data and RLS via Supabase dashboard.

- [x] 2.0 Events Feature Implementation
  - [x] 2.1 Implement `src/api/events.ts` with `listEvents(search?: string)` sorted by `start_time`.
  - [x] 2.2 Create Zustand store `src/stores/events.ts` exposing `events`, `fetchEvents`, `searchQuery`, `setSearchQuery`.
  - [x] 2.3 Build `EventCard.tsx` with image thumbnail, title, relative time, tag chips.
  - [x] 2.4 Create `events.tsx` tab screen: FlatList of `EventCard`; call `fetchEvents()` on mount.
  - [x] 2.5 Add search TextInput with 400 ms debounce; update `searchQuery` and refetch.
  - [x] 2.6 Implement `events/[eventId].tsx` detail screen displaying full event info.
  - [x] 2.7 Write unit tests for API, store, and EventCard component.

- [ ] 3.0 Onboarding Flow Implementation
  - [ ] 3.1 Set up stack navigator at `src/app/onboarding/(stack)` with three screens.
  - [ ] 3.2 Implement `Personality.tsx` screen with progress bar, TextInput, save draft to local state.
  - [ ] 3.3 Persist personality to Supabase on "Next"; handle validation (≤ 250 chars).
  - [ ] 3.4 Implement `CurrentActivities.tsx` screen capturing up to 5 current activities.
  - [ ] 3.5 Implement `DesiredActivities.tsx` screen capturing up to 5 desired activities; on completion navigate to main tabs.
  - [ ] 3.6 Add logic at app startup to redirect incomplete profiles to onboarding flow.
  - [ ] 3.7 Unit tests for onboarding navigation and data persistence.

- [ ] 4.0 Profile Editing Feature Implementation
  - [ ] 4.1 Add "Edit Profile" button to existing Account modal; navigate to `profile/edit.tsx`.
  - [ ] 4.2 Build edit screen reusing onboarding UI components; pre-fill existing data.
  - [ ] 4.3 Validate personality and interests text lengths & counts; show inline errors.
  - [ ] 4.4 Persist updates to Supabase; update local stores.
  - [ ] 4.5 Unit tests for edit flow and validation helpers.

- [ ] 5.0 GPT-Based Suggestion System
  - [ ] 5.1 Implement edge function `refine-user-inputs+api.ts` calling OpenAI GPT-4.1 nano with proper system prompt.
  - [ ] 5.2 Create or enhance `useDebounce` hook to fetch suggestions after 800 ms of user input.
  - [ ] 5.3 Integrate suggestions UI beneath TextInput on onboarding and edit screens.
  - [ ] 5.4 Ensure `OPENAI_API_KEY` is available and edge function is secured.
  - [ ] 5.5 Unit tests with mocked OpenAI responses.

- [ ] 6.0 Reusable UserCard Component & Validation
  - [ ] 6.1 Implement `UserCard.tsx` with props `showPersonality`, `showInterests`, `showInviteCTA`.
  - [ ] 6.2 Replace existing user card usages throughout codebase with new component.
  - [ ] 6.3 Create `relativeTime.ts` util to format "in X h" strings for events.
  - [ ] 6.4 Centralize validation helpers for character limits and counts.
  - [ ] 6.5 Unit tests for UserCard component and validation utilities. 