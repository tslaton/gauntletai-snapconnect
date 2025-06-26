# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SnapConnect is a Snapchat clone with RAG (Retrieval-Augmented Generation) capabilities built using React Native with Expo. The app features photo capture, real-time messaging, friend management, and AI-powered features.

## Development Commands

```bash
# Start development server
npm start

# Run on specific platforms
npm run android  # Android emulator
npm run ios      # iOS simulator
npm run web      # Web browser

# Testing
npm test         # Run tests in watch mode
jest             # Run tests once

# Linting
npm run lint

# Database
npm run db:generate  # Generate Drizzle migrations
npm run db:reinit    # Reinitialize test database

# Build for production
npm run build    # Build for all platforms using EAS
```

## Architecture Overview

### Frontend Architecture
- **Framework**: React Native + Expo with file-based routing
- **State Management**: Zustand stores in `/src/stores/`
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: Expo Router - file-based routing in `/src/app/`

### Backend Architecture
- **Database**: PostgreSQL on Supabase with vector extensions
- **ORM**: Drizzle ORM with schemas in `/server/src/db/schema/`
- **Auth**: Supabase Auth with RLS policies
- **Storage**: Supabase Storage for photos/media
- **Real-time**: Supabase Realtime for messaging

### Key Directories
- `/src/app/` - Screen components (file-based routing)
  - `index.tsx` - Authentication screen
  - `/camera/` - Camera functionality
  - `/chat/` - Messaging screens
  - `/friends/` - Friend management
- `/src/components/` - Reusable UI components
- `/src/stores/` - Zustand state stores
- `/src/utils/` - API helpers and utilities
- `/server/` - Backend code and database schemas

## State Management Pattern

Zustand stores follow this pattern:
```typescript
interface StoreState {
  // State properties
  data: Type[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchData: () => Promise<void>;
  updateData: (data: Type) => void;
}
```

## API Integration Pattern

All Supabase operations use the client in `/src/utils/supabase.ts`:
```typescript
// Example usage
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', value);
```

## Database Schema

Key tables:
- `profiles` - User profile information
- `friends` - Friend relationships (bidirectional)
- `friend_requests` - Pending friend requests
- `conversations` - Chat conversations
- `messages` - Individual messages with disappearing functionality
- `conversation_participants` - Many-to-many for conversations

## Testing

Tests use Jest with React Native Testing Library:
```bash
# Run specific test
jest path/to/test.tsx

# Run tests matching pattern
jest --testNamePattern="ComponentName"
```

## Important Implementation Details

1. **Authentication Flow**: 
   - Check auth state in `src/stores/userStore.ts`
   - Protected routes redirect to index if not authenticated

2. **Camera Integration**:
   - Uses expo-camera with custom controls
   - Photos saved to Supabase Storage before sending

3. **Real-time Messaging**:
   - Supabase Realtime subscriptions in message stores
   - Disappearing messages handled with `expires_at` field

4. **Friend System**:
   - Bidirectional friend relationships
   - Friend requests require acceptance
   - Search by username with privacy controls

5. **TypeScript Configuration**:
   - Strict mode enabled
   - Path alias `@/` maps to `./src/`
   - Use type imports when possible

## Common Development Tasks

When implementing new features:
1. Create screen in `/src/app/` for new routes
2. Add reusable components to `/src/components/`
3. Create/update Zustand store if state management needed
4. Add database migrations using `npm run db:generate`
5. Implement RLS policies for new tables
6. Add tests in `__tests__/` directory

When debugging:
- Check Expo logs for client-side errors
- Use Supabase dashboard for database/auth issues
- Verify RLS policies if getting permission errors
- Check network tab for API failures