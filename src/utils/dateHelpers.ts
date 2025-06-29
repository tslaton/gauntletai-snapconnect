/**
 * @file Date and time utility functions for the itineraries feature
 */

import type { Activity } from '@/api/activities';
import { getTimezoneOffset } from 'date-fns-tz';

/**
 * Groups activities by day based on their start_time
 * @param activities Array of activities to group
 * @returns Object with date strings as keys and arrays of activities as values
 */
export function groupActivitiesByDay(activities: Activity[]): Record<string, Activity[]> {
  const grouped: Record<string, Activity[]> = {};
  
  activities.forEach(activity => {
    if (activity.start_time) {
      const date = new Date(activity.start_time);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(activity);
    }
  });
  
  // Sort activities within each day by start time
  Object.keys(grouped).forEach(dateKey => {
    grouped[dateKey].sort((a, b) => {
      const timeA = a.start_time ? new Date(a.start_time).getTime() : 0;
      const timeB = b.start_time ? new Date(b.start_time).getTime() : 0;
      return timeA - timeB;
    });
  });
  
  return grouped;
}

/**
 * Formats a date range nicely
 * @param startDate Start date string
 * @param endDate End date string
 * @returns Formatted date range string
 */
export function formatDateRange(startDate?: string | null, endDate?: string | null): string {
  if (!startDate && !endDate) {
    return '';
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // If same year, omit year from start date
    if (start.getFullYear() === end.getFullYear()) {
      const startFormatted = start.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
      return `${startFormatted} - ${formatDate(endDate)}`;
    }
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  } else if (startDate) {
    return `Starts ${formatDate(startDate)}`;
  } else if (endDate) {
    return `Ends ${formatDate(endDate)}`;
  }
  
  return '';
}

/**
 * Calculates day numbers for activities based on itinerary start date
 * @param activityDate Date of the activity
 * @param itineraryStartDate Start date of the itinerary
 * @returns Day number (1-based) or null if cannot calculate
 */
export function calculateDayNumber(activityDate: string, itineraryStartDate?: string | null): number | null {
  if (!itineraryStartDate) {
    return null;
  }
  
  const activity = new Date(activityDate);
  const start = new Date(itineraryStartDate);
  
  // Reset time parts to compare just dates
  activity.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  
  const diffTime = activity.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays + 1; // 1-based day numbering
}

/**
 * Formats a time range nicely
 * @param startTime Start time string
 * @param endTime End time string
 * @param timezone Optional timezone to display the time in (e.g., 'America/New_York')
 * @returns Formatted time range string
 */
export function formatTimeRange(startTime?: string | null, endTime?: string | null, timezone?: string | null): string {
  if (!startTime && !endTime) {
    return '';
  }
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    
    // If timezone is provided, format in that timezone
    // TODO: use this later... the seed data and most UX looks best in local time
    // if (timezone) {
    //   try {
    //     return formatInTimeZone(date, timezone, 'h:mm a');
    //   } catch (error) {
    //     console.error('Error formatting time in timezone:', error);
    //     // Fall back to default formatting
    //   }
    // }
    
    // Default formatting using browser's locale
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  if (startTime && endTime) {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  } else if (startTime) {
    return `Starts at ${formatTime(startTime)}`;
  } else if (endTime) {
    return `Ends at ${formatTime(endTime)}`;
  }
  
  return '';
}

/**
 * Gets a human-readable day label with day number, weekday, and date
 * @param date Date to format
 * @param dayNumber Optional day number to include
 * @returns Formatted day label (e.g., "Day 1 - Monday, Jan 15")
 */
export function getDayLabel(date: string | Date, dayNumber?: number | null): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  if (dayNumber !== null && dayNumber !== undefined) {
    return `Day ${dayNumber} - ${dayName}, ${monthDay}`;
  }
  
  return `${dayName}, ${monthDay}`;
}

/**
 * Calculates the duration between two dates in days
 * @param startDate Start date
 * @param endDate End date
 * @returns Number of days (inclusive) or null if invalid
 */
export function calculateTripDuration(startDate?: string | null, endDate?: string | null): number | null {
  if (!startDate || !endDate) {
    return null;
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Reset time parts to compare just dates
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays + 1; // Inclusive of both start and end days
}

// Convert timezone offset from milliseconds to minutes
// https://www.perplexity.ai/search/use-date-fns-tz-to-convert-tim-gMiVnS6WQVCvqO5vayuI1w
export function getTimezoneOffsetInMinutes(timeZoneName: string, date = new Date()) {
  const offsetInMs = getTimezoneOffset(timeZoneName, date)
  return offsetInMs / (60 * 1000) // Convert milliseconds to minutes
}