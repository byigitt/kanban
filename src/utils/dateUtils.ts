import {
  format,
  isAfter,
  isBefore,
  isSameDay,
  addDays,
  startOfDay,
  endOfDay,
} from "date-fns";

/**
 * Formats a date string to a human-readable format
 * @param dateString ISO date string
 * @param formatStr Format string for date-fns
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string,
  formatStr: string = "MMM d, yyyy"
): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return format(date, formatStr);
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

/**
 * Checks if a date is overdue (before today)
 * @param dateString ISO date string
 * @returns boolean
 */
export const isOverdue = (dateString: string): boolean => {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    const today = startOfDay(new Date());
    return isBefore(date, today);
  } catch (error) {
    console.error("Error checking if date is overdue:", error);
    return false;
  }
};

/**
 * Checks if a date is today
 * @param dateString ISO date string
 * @returns boolean
 */
export const isToday = (dateString: string): boolean => {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    const today = new Date();
    return isSameDay(date, today);
  } catch (error) {
    console.error("Error checking if date is today:", error);
    return false;
  }
};

/**
 * Checks if a date is within the next n days
 * @param dateString ISO date string
 * @param days Number of days to check
 * @returns boolean
 */
export const isWithinDays = (dateString: string, days: number): boolean => {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    const today = startOfDay(new Date());
    const futureDate = endOfDay(addDays(today, days));
    return isAfter(date, today) && isBefore(date, futureDate);
  } catch (error) {
    console.error("Error checking if date is within days:", error);
    return false;
  }
};

/**
 * Checks if a date is in the future (after the specified number of days)
 * @param dateString ISO date string
 * @param afterDays Number of days after which to consider as future
 * @returns boolean
 */
export const isFuture = (
  dateString: string,
  afterDays: number = 7
): boolean => {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    const futureDate = startOfDay(addDays(new Date(), afterDays));
    return isAfter(date, futureDate);
  } catch (error) {
    console.error("Error checking if date is in future:", error);
    return false;
  }
};

/**
 * Returns a CSS class based on due date status
 * @param dateString ISO date string
 * @returns CSS class name
 */
export const getDueDateStatusClass = (dateString: string): string => {
  if (!dateString) return "";

  if (isOverdue(dateString)) {
    return "text-red-500";
  } else if (isToday(dateString)) {
    return "text-orange-500";
  } else if (isWithinDays(dateString, 7)) {
    return "text-yellow-500";
  } else {
    return "text-green-500";
  }
};

/**
 * Returns a human-readable string describing the due date status
 * @param dateString ISO date string
 * @returns Status string
 */
export const getDueDateStatusText = (dateString: string): string => {
  if (!dateString) return "";

  if (isOverdue(dateString)) {
    return "Overdue";
  } else if (isToday(dateString)) {
    return "Due today";
  } else if (isWithinDays(dateString, 7)) {
    return "Due this week";
  } else {
    return "Future";
  }
};
