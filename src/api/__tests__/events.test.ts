/**
 * @file Unit tests for events API functions
 * Tests the API layer for fetching and searching events
 */

import { getEventById, listEvents, listEventsWithCreators } from '@/api/events';
import { supabase } from '@/utils/supabase';

// Mock the supabase client
jest.mock('@/utils/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Mock data
const mockEvent = {
  id: 'event-1',
  title: 'Test Event',
  description: 'A test event description',
  location: 'Test Location',
  start_time: '2025-01-01T10:00:00Z',
  end_time: '2025-01-01T12:00:00Z',
  image_url: 'https://example.com/image.jpg',
  tags: ['test', 'event'],
  max_attendees: 50,
  created_by: 'user-1',
  created_at: '2024-12-01T10:00:00Z',
  updated_at: '2024-12-01T10:00:00Z',
};

const mockEventWithCreator = {
  ...mockEvent,
  profiles: {
    id: 'user-1',
    username: 'testuser',
    full_name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
  },
};

const createMockSupabaseQuery = () => {
  const query = {
    select: jest.fn().mockReturnThis(),
    order: jest.fn(),
    or: jest.fn(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  };
  
  // Set up the return values for this instance
  query.order.mockReturnValue(query);
  query.or.mockReturnValue(query);
  
  return query;
};

describe('Events API', () => {
  let mockSupabaseQuery: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseQuery = createMockSupabaseQuery();
    (supabase.from as jest.Mock).mockReturnValue(mockSupabaseQuery);
  });

  describe('listEvents', () => {
    it('should fetch events successfully without search', async () => {
      mockSupabaseQuery.order.mockResolvedValue({
        data: [mockEvent],
        error: null,
      });

      const result = await listEvents();

      expect(supabase.from).toHaveBeenCalledWith('events');
      expect(mockSupabaseQuery.select).toHaveBeenCalledWith(expect.stringContaining('id'));
      expect(mockSupabaseQuery.order).toHaveBeenCalledWith('start_time', { ascending: true });
      expect(mockSupabaseQuery.or).not.toHaveBeenCalled();
      
      expect(result).toEqual([{
        id: 'event-1',
        title: 'Test Event',
        description: 'A test event description',
        location: 'Test Location',
        startTime: '2025-01-01T10:00:00Z',
        endTime: '2025-01-01T12:00:00Z',
        imageUrl: 'https://example.com/image.jpg',
        tags: ['test', 'event'],
        maxAttendees: 50,
        createdBy: 'user-1',
        createdAt: '2024-12-01T10:00:00Z',
        updatedAt: '2024-12-01T10:00:00Z',
      }]);
    });

    it('should fetch events with search filter', async () => {
      mockSupabaseQuery.or.mockResolvedValue({
        data: [mockEvent],
        error: null,
      });

      const result = await listEvents('test');

      expect(supabase.from).toHaveBeenCalledWith('events');
      expect(mockSupabaseQuery.or).toHaveBeenCalledWith(expect.stringContaining('title.ilike.%test%'));
      
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Test Event');
    });

    it('should handle empty search query', async () => {
      mockSupabaseQuery.order.mockResolvedValue({
        data: [mockEvent],
        error: null,
      });

      const result = await listEvents('   ');

      expect(mockSupabaseQuery.or).not.toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should handle database errors', async () => {
      mockSupabaseQuery.order.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(listEvents()).rejects.toThrow('Failed to fetch events. Please try again.');
    });

    it('should return empty array when no data', async () => {
      mockSupabaseQuery.order.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await listEvents();
      expect(result).toEqual([]);
    });
  });

  describe('listEventsWithCreators', () => {
    it('should fetch events with creator information', async () => {
      mockSupabaseQuery.order.mockResolvedValue({
        data: [mockEventWithCreator],
        error: null,
      });

      const result = await listEventsWithCreators();

      expect(mockSupabaseQuery.select).toHaveBeenCalledWith(expect.stringContaining('profiles!events_created_by_profiles_id_fk'));
      expect(result).toHaveLength(1);
      expect(result[0].creator).toEqual({
        id: 'user-1',
        username: 'testuser',
        fullName: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
      });
    });

    it('should handle events without creators', async () => {
      const eventWithoutCreator = { ...mockEvent, profiles: null };
      mockSupabaseQuery.order.mockResolvedValue({
        data: [eventWithoutCreator],
        error: null,
      });

      const result = await listEventsWithCreators();

      expect(result).toHaveLength(1);
      expect(result[0].creator).toBeNull();
    });
  });

  describe('getEventById', () => {
    it('should fetch single event by ID', async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: mockEventWithCreator,
        error: null,
      });

      const result = await getEventById('event-1');

      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('id', 'event-1');
      expect(mockSupabaseQuery.single).toHaveBeenCalled();
      expect(result).toBeTruthy();
      expect(result?.id).toBe('event-1');
      expect(result?.creator).toBeTruthy();
    });

    it('should return null when event not found', async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }, // Not found error code
      });

      const result = await getEventById('non-existent');
      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: null,
        error: { code: 'OTHER_ERROR', message: 'Database error' },
      });

      await expect(getEventById('event-1')).rejects.toThrow('Failed to fetch event. Please try again.');
    });

    it('should return null when no data returned', async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await getEventById('event-1');
      expect(result).toBeNull();
    });
  });

  describe('data transformation', () => {
    it('should handle events with missing optional fields', async () => {
      const minimalEvent = {
        id: 'event-2',
        title: 'Minimal Event',
        description: null,
        location: 'Location Only',
        start_time: '2025-01-01T10:00:00Z',
        end_time: null,
        image_url: null,
        tags: null,
        max_attendees: null,
        created_by: null,
        created_at: '2024-12-01T10:00:00Z',
        updated_at: '2024-12-01T10:00:00Z',
      };

      mockSupabaseQuery.order.mockResolvedValue({
        data: [minimalEvent],
        error: null,
      });

      const result = await listEvents();

      expect(result[0]).toEqual({
        id: 'event-2',
        title: 'Minimal Event',
        description: null,
        location: 'Location Only',
        startTime: '2025-01-01T10:00:00Z',
        endTime: null,
        imageUrl: null,
        tags: [],
        maxAttendees: null,
        createdBy: null,
        createdAt: '2024-12-01T10:00:00Z',
        updatedAt: '2024-12-01T10:00:00Z',
      });
    });
  });
}); 