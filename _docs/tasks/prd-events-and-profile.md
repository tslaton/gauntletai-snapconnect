# Events & Profile Enhancement PRD

## 1. Introduction / Overview
This feature set introduces two pivotal capabilities:

1. **Events Discovery (Phase 1)** — A new **Events** tab that lists upcoming events (seeded data) in chronological order, backed by a Supabase `events` table. Users can keyword-search (simple lowercase text match) and view event details.
2. **User Profile Onboarding & Editing (Phase 1)** — A sequential, progress-tracked onboarding flow after sign-up that captures a user's personality type and two interest lists. The same data is editable later via an expanded **Edit Profile** screen. GPT-4.1 suggestions refine user input in real-time.

Together, these lay the groundwork for our niche: helping users find like-minded people and nearby activities quickly.

## 2. User Stories
1. **As a new user**, I want to answer a few onboarding questions so that the app can recommend relevant events and people.
2. **As a user**, I want real-time AI suggestions that help me make my answers more descriptive, so my profile is richer.
3. **As a user**, I want to browse a chronologically ordered list of upcoming events so I can decide what to attend.
4. **As a user**, I want to tap an event and view its key details so that I can decide whether it interests me.
5. **As a user**, I want to edit my personality and interests later so my profile stays up-to-date.
6. **As a user**, I want to see concise personality and interest info on other users' cards so I can quickly gauge compatibility.

## 3. Functional Requirements
1. **Events Table**
   1.1  Columns: `id` (uuid, PK), `title`, `description`, `start_time` (timestamptz), `end_time` (timestamptz), `location_text`, `latitude`, `longitude`, `tags` (text[]), `capacity` (int), `image_url`, `created_at` (default now()).
   1.2  No FK to users for MVP.
2. **Seed Data**
   2.1  `_scripts/seed-dev-data.sh` appends SQL that inserts 20 events with start times 0-72 h from NOW().
3. **Events API & Store**
   3.1  Create `src/api/events.ts` with `listEvents(search?: string)` that returns events sorted by `start_time`.
   3.2  Add `events` Zustand store with `events`, `fetchEvents`, `searchQuery`, `setSearchQuery`.
4. **Events UI**
   4.1  Add an **Events** tab under `src/app/(tabs)/events.tsx`.
   4.2  Render FlatList of events; on mount call `fetchEvents()`.
   4.3  Make the Event card reusable (it may later appear in the map).
   4.4  Provide search input; debounce 400 ms; lowercase match against `title` & `tags` on server.
   4.5  Tapping an item navigates to `src/app/events/[eventId].tsx` (static screen with title, times, description, image).
5. **Onboarding Flow**
   5.1  Directory `src/app/onboarding/(stack)` with three screens: `Personality.tsx`, `CurrentActivities.tsx`, `DesiredActivities.tsx`.
   5.2  Progress bar (33 %, 66 %, 100 %).
   5.3  Each screen stores draft answers to local state and persists to Supabase on "Next".
   5.4  After final screen, navigate to main tab navigator.
6. **Profile Data Model**
   6.1  Table `user_interests` (id, user_id FK auth.users, category ENUM('current', 'desired'), text).
   6.2  Column `personality_description` (text) in `{public}.profiles` (assumes existing profile table).
   6.3  Column `about` (text) in `{public}.profiles` (assumes existing profile table).
7. **Profile Editing UI**
   7.1  Add "Edit Profile" button to existing `Account` modal → navigates to `src/app/profile/edit.tsx`.
   7.2  Same component hierarchy as onboarding screens; supports add/delete interest (max 5 each category).
8. **GPT-Based Suggestions**
   8.1  Edge route `src/app/server/dev/refine-user-inputs+api.ts` accepts `{ prompt: string, field: "personality"|"interest"|"about" }`.
   8.2  Calls OpenAI GPT-4.1 nano with system prompt to ask clarifying questions.
   8.3  Frontend hook `useDebounce(field, input)` debounces 800 ms and returns `suggestions`.
   8.4  UI renders suggestions beneath the TextInput
9. **Reusable UserCard**
   9.1  Create `src/components/UserCard.tsx` with props `{ showPersonality?: boolean; showInterests?: boolean; showInviteCTA?: boolean }`.
   9.2  Replace existing scattered user-card variants with this component.
10. **Validation & Limits**
    10.1  Personality text ≤ 250 chars.
    10.2  Each interest text ≤ 250 chars.
    10.3  Interest count per category ≤ 5.

## 4. Non-Goals / Out of Scope
- Map view implementation or clustering.
- Event "Join" / chat functionality.
- Re-ordering interests.
- Advanced search (RAG / semantic).
- KPIs & analytics dashboards.

## 5. Design Considerations (UI / UX)
- **Events List**: Card with image thumbnail (16:9), title, relative start time ("in 3 h" computed by utils function), and tag chips.
- **Onboarding Screens**: Clean white background, single TextInput, GPT suggestions in subtle shaded box.
- **Progress Bar**: NativeWind progress component at top.

## 7. Technical Considerations
- Use **Supabase** types-generated client for new tables.
- Ensure RLS policies allow `SELECT` on `events` (public) and `INSERT/UPDATE/SELECT` on `user_interests` for authenticated user.
- Environment variable `OPENAI_API_KEY` already present
- Debounce hooks via `useDebounce` util (already present in /src/app/hooks or to be implemented).
- Adhere to project lint rules; each new file < 500 lines if possible.

## 8. Open Questions
1. Should the `events` RLS allow anonymous (unauthenticated) read in the future?
2. Preferred image hosting for event cover photos (S3 vs. Supabase Storage)?
3. Do we want to auto-generate tags from event description via GPT during seeding?

---

*End of PRD* 