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

Zustand stores follow this detailed pattern from the React Native Expo rules:
```typescript
/**
 * @file This file contains the Zustand store for managing [feature] data.
 * It handles fetching, updating, and holding the state for [feature].
 */

import { create } from 'zustand';
import { supabase } from '@/utils/supabase';

interface StoreState {
  // State properties
  data: Type[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchData: () => Promise<void>;
  updateData: (data: Type) => void;
  clearError: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  // Initial state
  data: [],
  isLoading: false,
  error: null,

  // Actions
  clearError: () => set({ error: null }),
  
  fetchData: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('table_name')
        .select('*');
      
      if (error) throw error;
      
      set({ data: data || [] });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateData: (newData) => {
    // Use get() to access current state when needed
    const currentData = get().data;
    set({ data: [...currentData, newData] });
  },
}));
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

### Row Level Security (RLS) Best Practices

Based on Supabase RLS guidelines:

1. **Policy Structure**:
   ```sql
   -- SELECT policies use USING clause only
   CREATE POLICY "Users can view their own profile" 
   ON profiles FOR SELECT 
   TO authenticated 
   USING ((SELECT auth.uid()) = id);

   -- INSERT policies use WITH CHECK clause only
   CREATE POLICY "Users can create their profile" 
   ON profiles FOR INSERT 
   TO authenticated 
   WITH CHECK ((SELECT auth.uid()) = id);

   -- UPDATE policies use both USING and WITH CHECK
   CREATE POLICY "Users can update their own profile" 
   ON profiles FOR UPDATE 
   TO authenticated 
   USING ((SELECT auth.uid()) = id)
   WITH CHECK ((SELECT auth.uid()) = id);

   -- DELETE policies use USING clause only
   CREATE POLICY "Users can delete their own profile" 
   ON profiles FOR DELETE 
   TO authenticated 
   USING ((SELECT auth.uid()) = id);
   ```

2. **Performance Optimizations**:
   - Always specify roles (`TO authenticated` or `TO authenticated, anon`)
   - Use `(SELECT auth.uid())` instead of `auth.uid()` for caching
   - Add indexes on columns used in policies
   - Minimize joins in policies - use IN or ANY operations instead

3. **Important Guidelines**:
   - Never use `FOR ALL` - create separate policies for each operation
   - Use descriptive policy names in double quotes
   - Prefer PERMISSIVE over RESTRICTIVE policies
   - Use `auth.uid()` not `current_user`
   - Always use double apostrophes in SQL strings (e.g., `'Night''s watch'`)

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

## NPM Package Management

Before using any npm package:
1. Check if it exists in `package.json` dependencies
2. If not installed, run: `npm install package-name`
3. Always verify packages are installed before importing

Example check:
```javascript
// Check package.json before using a new package
const packageJson = require('./package.json');
const isInstalled = packageJson.dependencies['package-name'] || 
                   packageJson.devDependencies['package-name'];

if (!isInstalled) {
  console.log('Run: npm install package-name');
}
```

## Component Best Practices

Based on React Native Expo patterns:

1. **Component Structure**:
   - Use functional components with hooks
   - Keep components small and focused
   - Use TypeScript for all components
   - Apply NativeWind classes for styling

2. **Performance**:
   - Use React.memo for expensive components
   - Implement proper list rendering with FlatList
   - Handle loading and error states properly
   - Use proper image optimization

3. **Error Handling**:
   - Implement error boundaries for critical sections
   - Use try-catch blocks in async operations
   - Always handle promise rejections
   - Provide user-friendly error messages

4. **Security Considerations**:
   - Use Expo SecureStore for sensitive data
   - Never store auth tokens in plain text
   - Validate all user inputs
   - Implement proper session management