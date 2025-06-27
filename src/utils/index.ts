/**
 * @file Utility functions used throughout the application
 */

/**
 * Converts a date string to a human-readable relative time string
 * 
 * @param dateString - ISO date string to convert
 * @returns Relative time string (e.g., "2h", "3d", "1w")
 */
export function timeAgo(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Years
  let interval = seconds / 31536000;
  if (interval > 1) return `${Math.floor(interval)}y`;
  
  // Months
  interval = seconds / 2592000;
  if (interval > 1) return `${Math.floor(interval)}mo`;
  
  // Weeks
  interval = seconds / 604800;
  if (interval > 1) return `${Math.floor(interval)}w`;
  
  // Days
  interval = seconds / 86400;
  if (interval > 1) return `${Math.floor(interval)}d`;
  
  // Hours
  interval = seconds / 3600;
  if (interval > 1) return `${Math.floor(interval)}h`;
  
  // Minutes
  interval = seconds / 60;
  if (interval > 1) return `${Math.floor(interval)}m`;
  
  // Less than a minute
  return 'now';
}