/**
 * Formats a time string to 12-hour format (e.g., "14:30" -> "2:30 PM")
 * @param time Time string in 24-hour format (HH:MM)
 * @returns Time string in 12-hour format with AM/PM
 */
export const formatTo12Hour = (time: string): string => {
  // If the time is already in 12-hour format or invalid, return as is
  if (!time || time.toLowerCase().includes('am') || time.toLowerCase().includes('pm')) {
    return time;
  }

  try {
    const [hours, minutes] = time.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) {
      return time; // Return original if parsing failed
    }
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return time; // Return original on error
  }
};

/**
 * Formats a time string to 24-hour format (e.g., "2:30 PM" -> "14:30")
 * @param time Time string in 12-hour format (h:mm AM/PM)
 * @returns Time string in 24-hour format (HH:MM)
 */
export const formatTo24Hour = (time: string): string => {
  // If the time is already in 24-hour format or invalid, return as is
  if (!time || (!time.toLowerCase().includes('am') && !time.toLowerCase().includes('pm'))) {
    // Check if it matches 24-hour format (contains : but no AM/PM)
    if (time.includes(':')) {
      return time;
    }
  }

  try {
    // Extract hours, minutes, and period
    const timeRegex = /(\d+):(\d+)\s*(AM|PM|am|pm)/i;
    const match = time.match(timeRegex);
    
    if (!match) {
      return time; // Return original if format doesn't match
    }
    
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    
    // Convert to 24-hour format
    if (period === 'PM' && hours < 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error formatting time to 24-hour:', error);
    return time; // Return original on error
  }
};

/**
 * Formats a time string to a consistent format
 * @param time Time string in any format
 * @returns Formatted time string
 */
export const formatTime = (time: string): string => {
  // Check if the time might be in 24-hour format (contains : but no AM/PM)
  if (time.includes(':') && !time.toLowerCase().includes('am') && !time.toLowerCase().includes('pm')) {
    return formatTo12Hour(time);
  }
  return time;
};

/**
 * Converts a Date object to a time string in 24-hour format
 * @param date Date object
 * @returns Time string in 24-hour format (HH:MM)
 */
export const dateToTimeString = (date: Date): string => {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

/**
 * Converts a time string to a Date object with the current date
 * @param timeStr Time string in 24-hour format (HH:MM)
 * @returns Date object with the current date and specified time
 */
export const timeStringToDate = (timeStr: string): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};