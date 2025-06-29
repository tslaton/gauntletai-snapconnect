/**
 * @file This file contains the Zustand store for managing stories data.
 * It handles fetching, updating, and holding the state for stories.
 */

import { supabase } from '@/utils/supabase';
import { create } from 'zustand';

export interface StoryContent {
  id: string;
  story_id: string;
  user_id: string;
  type: 'photo' | 'video';
  content_url: string;
  index: number;
  created_at: string;
}

export interface Story {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    about: string | null;
  };
  story_contents?: StoryContent[];
}

interface StoriesState {
  // State properties
  recommendedStories: Story[];
  currentStory: Story | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchRecommendedStories: () => Promise<void>;
  fetchStory: (userId: string) => Promise<void>;
  addStoryContent: (content: Omit<StoryContent, 'id' | 'created_at' | 'index'>) => Promise<void>;
  removeStoryContent: (contentId: string) => Promise<void>;
  clearError: () => void;
}

export const useStoriesStore = create<StoriesState>((set, get) => ({
  // Initial state
  recommendedStories: [],
  currentStory: null,
  isLoading: false,
  error: null,

  // Actions
  clearError: () => set({ error: null }),
  
  fetchRecommendedStories: async () => {
    set({ isLoading: true, error: null });
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get users with similar itineraries
      // First, get locations from current user's itineraries
      const { data: userItineraries } = await supabase
        .from('itineraries')
        .select('id, activities(location)')
        .eq('created_by', user.id);
      
      const userLocations = new Set<string>();
      userItineraries?.forEach(itinerary => {
        itinerary.activities?.forEach((activity: any) => {
          if (activity.location) {
            userLocations.add(activity.location.toLowerCase());
          }
        });
      });

      // If user has no itineraries, just fetch recent stories
      if (userLocations.size === 0) {
        const { data, error } = await supabase
          .from('stories')
          .select(`
            *,
            profiles!inner (
              username,
              full_name,
              avatar_url,
              about
            ),
            story_contents (
              id,
              type,
              content_url,
              index
            )
          `)
          .neq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(20);
        
        if (error) throw error;
        
        const storiesWithContent = (data || []).filter(
          story => story.story_contents && story.story_contents.length > 0
        );
        
        set({ recommendedStories: storiesWithContent });
        return;
      }

      // Find users with similar travel locations
      const { data: similarUsers } = await supabase
        .from('itineraries')
        .select(`
          created_by,
          activities(location)
        `)
        .neq('created_by', user.id);
      
      // Score users by location overlap
      const userScores = new Map<string, number>();
      similarUsers?.forEach(itinerary => {
        const userId = itinerary.created_by;
        itinerary.activities?.forEach((activity: any) => {
          if (activity.location && userLocations.has(activity.location.toLowerCase())) {
            userScores.set(userId, (userScores.get(userId) || 0) + 1);
          }
        });
      });

      // Sort users by similarity score
      const rankedUsers = Array.from(userScores.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([userId]) => userId);

      // Fetch stories from similar users first, then fill with recent stories
      let query = supabase
        .from('stories')
        .select(`
          *,
          profiles!inner (
            username,
            full_name,
            avatar_url,
            about
          ),
          story_contents (
            id,
            type,
            content_url,
            index
          )
        `)
        .neq('user_id', user.id);
      
      if (rankedUsers.length > 0) {
        query = query.in('user_id', rankedUsers);
      }
      
      const { data, error } = await query
        .order('updated_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      // Filter stories that have at least one content
      const storiesWithContent = (data || []).filter(
        story => story.story_contents && story.story_contents.length > 0
      );
      
      set({ recommendedStories: storiesWithContent });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch stories';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  fetchStory: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          profiles!inner (
            username,
            full_name,
            avatar_url,
            about
          ),
          story_contents (
            id,
            story_id,
            user_id,
            type,
            content_url,
            index,
            created_at
          )
        `)
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      
      // Sort story contents by index
      if (data?.story_contents) {
        data.story_contents.sort((a: StoryContent, b: StoryContent) => a.index - b.index);
      }
      
      set({ currentStory: data });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch story';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  addStoryContent: async (content) => {
    set({ error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get or create user's story
      let { data: story, error: storyError } = await supabase
        .from('stories')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (storyError && storyError.code === 'PGRST116') {
        // Story doesn't exist, create it
        const { data: newStory, error: createError } = await supabase
          .from('stories')
          .insert({ user_id: user.id })
          .select()
          .single();
        
        if (createError) throw createError;
        story = newStory;
      } else if (storyError) {
        throw storyError;
      }

      if (!story) throw new Error('Failed to get story');

      // Get the maximum index for this story
      const { data: existingContents } = await supabase
        .from('story_contents')
        .select('index')
        .eq('story_id', story.id)
        .order('index', { ascending: false })
        .limit(1);
      
      const nextIndex = existingContents && existingContents.length > 0 
        ? existingContents[0].index + 1 
        : 0;

      // Add content to story
      const { error: contentError } = await supabase
        .from('story_contents')
        .insert({
          ...content,
          story_id: story.id,
          user_id: user.id,
          index: nextIndex,
        });
      
      if (contentError) throw contentError;
      
      // Update story's updated_at timestamp
      await supabase
        .from('stories')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', story.id);
      
      // Refresh current story if viewing own
      if (get().currentStory?.user_id === user.id) {
        await get().fetchStory(user.id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add content';
      set({ error: message });
      throw error;
    }
  },
  
  removeStoryContent: async (contentId: string) => {
    set({ error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('story_contents')
        .delete()
        .eq('id', contentId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Refresh current story if viewing own
      if (get().currentStory?.user_id === user.id) {
        await get().fetchStory(user.id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove content';
      set({ error: message });
      throw error;
    }
  },
}));