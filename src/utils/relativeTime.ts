/**
 * @file Utility functions for formatting relative time, especially for future events
 * Provides functions to display when events will start relative to now
 */

/**
 * Converts a future date string to a human-readable relative time string
 * 
 * @param dateString - ISO date string to convert (should be in the future)
 * @returns Relative time string (e.g., "in 2h", "in 3 days", "in 1 week")
 */
export function relativeTime(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((date.getTime() - now.getTime()) / 1000);

  // If the date is in the past, return "started" or past time
  if (seconds < 0) {
    const pastSeconds = Math.abs(seconds);
    
    // Less than 5 minutes ago, consider it "starting soon"
    if (pastSeconds < 300) return 'starting soon';
    
    // Otherwise show it started some time ago
    let interval = pastSeconds / 31536000;
    if (interval > 1) return `started ${Math.floor(interval)}y ago`;
    
    interval = pastSeconds / 2592000;
    if (interval > 1) return `started ${Math.floor(interval)}mo ago`;
    
    interval = pastSeconds / 604800;
    if (interval > 1) return `started ${Math.floor(interval)}w ago`;
    
    interval = pastSeconds / 86400;
    if (interval > 1) return `started ${Math.floor(interval)}d ago`;
    
    interval = pastSeconds / 3600;
    if (interval > 1) return `started ${Math.floor(interval)}h ago`;
    
    interval = pastSeconds / 60;
    if (interval > 1) return `started ${Math.floor(interval)}m ago`;
    
    return 'starting soon';
  }

  // Future times
  // Less than a minute
  if (seconds < 60) return 'starting soon';
  
  // Minutes
  let interval = seconds / 60;
  if (interval < 60) return `in ${Math.floor(interval)}m`;
  
  // Hours
  interval = seconds / 3600;
  if (interval < 24) return `in ${Math.floor(interval)}h`;
  
  // Days
  interval = seconds / 86400;
  if (interval < 7) {
    const days = Math.floor(interval);
    return `in ${days} ${days === 1 ? 'day' : 'days'}`;
  }
  
  // Weeks
  interval = seconds / 604800;
  if (interval < 4) {
    const weeks = Math.floor(interval);
    return `in ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
  }
  
  // Months
  interval = seconds / 2592000;
  if (interval < 12) {
    const months = Math.floor(interval);
    return `in ${months} ${months === 1 ? 'month' : 'months'}`;
  }
  
  // Years
  interval = seconds / 31536000;
  const years = Math.floor(interval);
  return `in ${years} ${years === 1 ? 'year' : 'years'}`;
}

/**
 * Formats a date for display in event cards (e.g., "Today 3:00 PM", "Tomorrow 10:00 AM", "Dec 25, 2:30 PM")
 * 
 * @param dateString - ISO date string to format
 * @returns Formatted date string
 */
export function formatEventTime(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  
  // Check if it's today
  const isToday = date.toDateString() === now.toDateString();
  
  // Check if it's tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  
  // Format time portion
  const timeString = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  if (isToday) {
    return `Today ${timeString}`;
  }
  
  if (isTomorrow) {
    return `Tomorrow ${timeString}`;
  }
  
  // For other days, show month and day
  const dateOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric'
  };
  
  // Add year if it's not the current year
  if (date.getFullYear() !== now.getFullYear()) {
    dateOptions.year = 'numeric';
  }
  
  const formattedDate = date.toLocaleDateString('en-US', dateOptions);
  return `${formattedDate}, ${timeString}`;
} 