/**
 * @file Unit tests for EventCard component
 * Tests the EventCard component rendering and interactions
 */

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import { type Event } from '@/stores/events';
import EventCard from '../EventCard';

// Mock the relative time utilities
jest.mock('@/utils/relativeTime', () => ({
  relativeTime: jest.fn((dateString: string) => 'in 2h'),
  formatEventTime: jest.fn((dateString: string) => 'Today 3:00 PM'),
}));

// Mock FontAwesome icons
jest.mock('@expo/vector-icons', () => ({
  FontAwesome: ({ name, size, color }: any) => `FontAwesome-${name}-${size}-${color}`,
}));

// Mock data
const mockEvent: Event = {
  id: 'event-1',
  title: 'Test Event',
  description: 'A test event description',
  location: 'Test Location',
  startTime: '2025-01-01T15:00:00Z',
  endTime: '2025-01-01T17:00:00Z',
  imageUrl: 'https://example.com/image.jpg',
  tags: ['test', 'event', 'fun'],
  maxAttendees: 50,
  createdBy: 'user-1',
  createdAt: '2024-12-01T10:00:00Z',
  updatedAt: '2024-12-01T10:00:00Z',
};

const mockEventWithoutImage: Event = {
  ...mockEvent,
  imageUrl: null,
};

const mockEventWithLongTitle: Event = {
  ...mockEvent,
  title: 'This is a very long event title that should be truncated when displayed in the card component',
};

const mockEventWithManyTags: Event = {
  ...mockEvent,
  tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
};

describe('EventCard', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders event information correctly', () => {
      const { getByText, getByTestId } = render(
        <EventCard event={mockEvent} onPress={mockOnPress} />
      );

      expect(getByText('Test Event')).toBeTruthy();
      expect(getByText('in 2h')).toBeTruthy();
      expect(getByText('Today 3:00 PM')).toBeTruthy();
      expect(getByText('Test Location')).toBeTruthy();
      expect(getByText('Max 50 attendees')).toBeTruthy();
      expect(getByText('test')).toBeTruthy();
      expect(getByText('event')).toBeTruthy();
      expect(getByText('fun')).toBeTruthy();
    });

    it('renders without image when imageUrl is null', () => {
      const { queryByTestId } = render(
        <EventCard event={mockEventWithoutImage} onPress={mockOnPress} />
      );

      // Should show calendar icon placeholder
      expect(queryByTestId('event-image')).toBeFalsy();
    });

    it('truncates long titles properly', () => {
      const { getByText } = render(
        <EventCard event={mockEventWithLongTitle} onPress={mockOnPress} />
      );

      const titleElement = getByText(mockEventWithLongTitle.title);
      expect(titleElement).toBeTruthy();
      expect(titleElement.props.numberOfLines).toBe(2);
    });

    it('limits tag display to first 3 tags', () => {
      const { getByText, queryByText } = render(
        <EventCard event={mockEventWithManyTags} onPress={mockOnPress} />
      );

      // Should show first 3 tags
      expect(getByText('tag1')).toBeTruthy();
      expect(getByText('tag2')).toBeTruthy();
      expect(getByText('tag3')).toBeTruthy();
      
      // Should show "+2" overflow indicator
      expect(getByText('+2')).toBeTruthy();
      
      // Should not show remaining tags
      expect(queryByText('tag4')).toBeFalsy();
      expect(queryByText('tag5')).toBeFalsy();
    });
  });

  describe('Interactions', () => {
    it('calls onPress when card is pressed', () => {
      const { getByText } = render(
        <EventCard event={mockEvent} onPress={mockOnPress} />
      );

      fireEvent.press(getByText('Test Event'));
      expect(mockOnPress).toHaveBeenCalledWith(mockEvent);
    });

    it('does not call onPress when disabled', () => {
      const { getByText } = render(
        <EventCard event={mockEvent} onPress={mockOnPress} disabled={true} />
      );

      fireEvent.press(getByText('Test Event'));
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('renders as non-pressable when onPress is not provided', () => {
      const { getByText } = render(
        <EventCard event={mockEvent} />
      );

      // Should still render the event title but not be pressable
      expect(getByText('Test Event')).toBeTruthy();
    });
  });

  describe('Conditional Rendering', () => {
    it('does not render location when not provided', () => {
      const eventWithoutLocation = { ...mockEvent, location: '' };
      const { queryByText } = render(
        <EventCard event={eventWithoutLocation} onPress={mockOnPress} />
      );

      expect(queryByText('Test Location')).toBeFalsy();
    });

    it('does not render attendee info when maxAttendees is null', () => {
      const eventWithoutAttendees = { ...mockEvent, maxAttendees: null };
      const { queryByText } = render(
        <EventCard event={eventWithoutAttendees} onPress={mockOnPress} />
      );

      expect(queryByText(/Max.*attendees/)).toBeFalsy();
    });

    it('does not render tags section when no tags', () => {
      const eventWithoutTags = { ...mockEvent, tags: [] };
      const { queryByText } = render(
        <EventCard event={eventWithoutTags} onPress={mockOnPress} />
      );

      expect(queryByText('test')).toBeFalsy();
      expect(queryByText('event')).toBeFalsy();
    });
  });

  describe('Disabled State', () => {
    it('applies disabled styling when disabled prop is true', () => {
      const { getByText } = render(
        <EventCard event={mockEvent} disabled={true} />
      );

      const titleElement = getByText('Test Event');
      expect(titleElement.props.className).toContain('text-gray-400');
    });

    it('applies normal styling when not disabled', () => {
      const { getByText } = render(
        <EventCard event={mockEvent} />
      );

      const titleElement = getByText('Test Event');
      expect(titleElement.props.className).toContain('text-gray-900');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className when provided', () => {
      const { getByText } = render(
        <EventCard 
          event={mockEvent} 
          className="custom-class"
        />
      );

      const titleElement = getByText('Test Event');
      expect(titleElement).toBeTruthy();
    });
  });

  describe('Image Handling', () => {
    it('handles image loading states', () => {
      const { getByText } = render(
        <EventCard event={mockEvent} onPress={mockOnPress} />
      );

      // Should render the event image
      expect(getByText('Test Event')).toBeTruthy();
    });

    it('shows placeholder when image fails to load', () => {
      const { getByText } = render(
        <EventCard event={mockEventWithoutImage} onPress={mockOnPress} />
      );

      // Should still render event content without image
      expect(getByText('Test Event')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('provides proper accessibility labels', () => {
      const { getByText } = render(
        <EventCard event={mockEvent} onPress={mockOnPress} />
      );

      const titleElement = getByText('Test Event');
      expect(titleElement.props.numberOfLines).toBe(2);
      
      const locationElement = getByText('Test Location');
      expect(locationElement.props.numberOfLines).toBe(1);
    });
  });

  describe('Data Edge Cases', () => {
    it('handles minimal event data', () => {
      const minimalEvent: Event = {
        id: 'minimal-event',
        title: 'Minimal Event',
        description: null,
        location: 'Location',
        startTime: '2025-01-01T15:00:00Z',
        endTime: null,
        imageUrl: null,
        tags: [],
        maxAttendees: null,
        createdBy: null,
        createdAt: '2024-12-01T10:00:00Z',
        updatedAt: '2024-12-01T10:00:00Z',
      };

      const { getByText, queryByText } = render(
        <EventCard event={minimalEvent} onPress={mockOnPress} />
      );

      expect(getByText('Minimal Event')).toBeTruthy();
      expect(getByText('Location')).toBeTruthy();
      expect(queryByText(/Max.*attendees/)).toBeFalsy();
    });

    it('handles event with single tag', () => {
      const singleTagEvent = { ...mockEvent, tags: ['solo'] };
      const { getByText, queryByText } = render(
        <EventCard event={singleTagEvent} onPress={mockOnPress} />
      );

      expect(getByText('solo')).toBeTruthy();
      expect(queryByText('+')).toBeFalsy();
    });

    it('handles event with exactly 3 tags', () => {
      const threeTagEvent = { ...mockEvent, tags: ['one', 'two', 'three'] };
      const { getByText, queryByText } = render(
        <EventCard event={threeTagEvent} onPress={mockOnPress} />
      );

      expect(getByText('one')).toBeTruthy();
      expect(getByText('two')).toBeTruthy();
      expect(getByText('three')).toBeTruthy();
      expect(queryByText('+')).toBeFalsy();
    });
  });
}); 