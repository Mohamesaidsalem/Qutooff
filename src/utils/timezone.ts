// Timezone utility functions

/**
 * Get user's current timezone
 */
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Get timezone offset in hours (for display purposes).
 * Note: This might not be precise for all historical or future dates due to DST changes.
 */
export const getTimezoneOffset = (timezone?: string): number => {
  const tz = timezone || getUserTimezone();
  const date = new Date();
  // Get UTC time at the current moment
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  // Get local time in the specified timezone at the current moment
  const localDate = new Date(date.toLocaleString("en-US", { timeZone: tz }));
  
  // Calculate the difference in hours
  return (localDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
};

/**
 * Get formatted timezone display name (e.g., "Africa/Cairo (EET)" or "Cairo (UTC+2)")
 * @param timezone - Timezone string (optional, auto-detected if not provided)
 * @param format - 'short' (e.g., EET) or 'offset' (e.g., UTC+2)
 */
export const getTimezoneDisplayName = (timezone?: string, format: 'short' | 'offset' = 'short'): string => {
  const tz = timezone || getUserTimezone();
  const now = new Date();

  if (format === 'short') {
    // New (Better) method from the newer code for short name
    const shortNameMatch = now.toLocaleDateString('en', {
      timeZoneName: 'short',
      timeZone: tz,
    }).match(/[A-Z]{3,5}$/); // Look for 3-5 uppercase letters at the end
    
    const shortName = shortNameMatch ? shortNameMatch[0] : '';
    return `${tz} (${shortName})`;
  } else {
    // Old method for offset display
    const offset = getTimezoneOffset(tz);
    const offsetStr = offset >= 0 ? `+${offset}` : `${offset}`;
    
    // Get city name from timezone (e.g., "Africa/Cairo" -> "Cairo")
    const cityName = tz.split('/').pop()?.replace('_', ' ') || tz;
    
    return `${cityName} (UTC${offsetStr})`;
  }
};

/**
 * Convert local datetime to UTC for storage
 * @param localDate - Date string in YYYY-MM-DD format
 * @param localTime - Time string in HH:MM format
 * @param timezone - User's timezone (optional, auto-detected if not provided)
 * @returns Object with UTC date and time strings, and original values.
 */
export const convertToUTC = (
  localDate: string, 
  localTime: string, 
  timezone?: string
) => {
  const userTimezone = timezone || getUserTimezone();
  
  // Create a date object interpreting localDateTlocalTime in the *server's* default timezone, 
  // then explicitly calculate UTC based on the known offset of the *user's* timezone.
  // This is a more robust approach than relying on `toLocaleString` for the conversion itself.
  const localAsUTC = new Date(`${localDate}T${localTime}:00`);
  const offsetHours = getTimezoneOffset(userTimezone);
  
  // Correct UTC: Subtract the timezone offset from the local time (in milliseconds)
  const correctUTC = new Date(localAsUTC.getTime() - (offsetHours * 60 * 60 * 1000));
  
  const utcDate = correctUTC.toISOString().split('T')[0];
  const utcTime = correctUTC.toTimeString().split(' ')[0].slice(0, 5); // HH:MM format
  const utcDateTimeStr = correctUTC.toISOString();
  
  return {
    utcDate,
    utcTime,
    utcDateTime: utcDateTimeStr,
    originalLocalDate: localDate, // Added from the newer code
    originalLocalTime: localTime, // Added from the newer code
    timezone: userTimezone // Added from the newer code
  };
};

/**
 * Convert UTC datetime to user's local timezone for display
 * @param utcDate - UTC date string in YYYY-MM-DD format
 * @param utcTime - UTC time string in HH:MM format
 * @param timezone - User's timezone (optional, auto-detected if not provided)
 * @returns Object with local date, time strings, and full Date object.
 */
export const convertFromUTC = (
  utcDate: string, 
  utcTime: string, 
  timezone?: string
) => {
  const userTimezone = timezone || getUserTimezone();
  
  // Create UTC datetime object (using 'Z' to ensure it's interpreted as UTC)
  const utcDateTime = new Date(`${utcDate}T${utcTime}:00.000Z`);
  
  // Convert to user's timezone strings
  // 'en-CA' gives YYYY-MM-DD
  const localDate = utcDateTime.toLocaleDateString('en-CA', { timeZone: userTimezone }); 
  // 'en-GB' with settings gives HH:MM (24-hour)
  const localTime = utcDateTime.toLocaleTimeString('en-GB', { 
    timeZone: userTimezone, 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  // A Date object representing the time in the local timezone (useful for comparisons)
  const localDateTime = new Date(utcDateTime.toLocaleString("en-US", { timeZone: userTimezone }));

  return {
    localDate,
    localTime,
    localDateTime,
    originalUtcDate: utcDate, // Added from the newer code
    originalUtcTime: utcTime, // Added from the newer code
    timezone: userTimezone // Added from the newer code
  };
};

/**
 * Convert stored UTC datetime string (ISO format) to local display
 * @param utcDateTime - UTC datetime string (ISO format)
 * @param userTimezone - User's timezone (optional)
 */
export const utcToLocal = (
  utcDateTime: string, 
  userTimezone?: string
): { localDate: string; localTime: string; localDateTime: Date } => {
  const utcDate = new Date(utcDateTime);
  const tz = userTimezone || getUserTimezone();
  
  const localDate = utcDate.toLocaleDateString('en-CA', { timeZone: tz });
  const localTime = utcDate.toLocaleTimeString('en-GB', { 
    timeZone: tz, 
    hour12: false,
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  // Create a Date object representing the time in the local timezone (via toLocaleString trick)
  const localDateTime = new Date(utcDate.toLocaleString("en-US", { timeZone: tz }));

  return {
    localDate,
    localTime,
    localDateTime
  };
};

/**
 * Get current date and time in user's timezone for form defaults or display
 */
export const getCurrentLocalDateTime = (timezone?: string) => {
  const userTimezone = timezone || getUserTimezone();
  const now = new Date();
  
  // Use toLocaleDateString/toLocaleTimeString with the target timezone
  const date = now.toLocaleDateString('en-CA', { timeZone: userTimezone }); // YYYY-MM-DD format
  const time = now.toLocaleTimeString('en-GB', { 
    timeZone: userTimezone,
    hour12: false,
    hour: '2-digit', 
    minute: '2-digit' 
  }); // HH:MM format
  
  return {
    date: date,
    time: time,
    timezone: userTimezone,
    timestamp: now.toISOString() // UTC timestamp
  };
};

/**
 * Format local datetime strings for structured display.
 * This function is useful if you already have the date/time in the desired local timezone.
 */
export const formatDateTimeForDisplay = (date: string, time: string, timezone?: string) => {
  const userTimezone = timezone || getUserTimezone();
  // NOTE: This creates a Date object interpreting the string in the system's timezone, 
  // but uses the Intl methods to format it *as if* it were in the target timezone.
  const datetime = new Date(`${date}T${time}:00`);
  
  return {
    dateString: datetime.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      timeZone: userTimezone
    }),
    timeString: datetime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: userTimezone
    }),
    fullString: datetime.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric', 
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: userTimezone
    })
  };
};

// --- Additional Utility Functions from the Older Code ---
// (These are useful for application logic)

/**
 * Check if a UTC datetime is today in user's timezone
 */
export const isToday = (utcDate: string, utcTime: string, userTimezone?: string): boolean => {
  const { localDate } = convertFromUTC(utcDate, utcTime, userTimezone);
  const today = new Date().toLocaleDateString('en-CA');
  return localDate === today;
};

/**
 * Check if a UTC datetime is in the past
 */
export const isPast = (utcDate: string, utcTime: string): boolean => {
  const utcDateTime = new Date(`${utcDate}T${utcTime}:00.000Z`);
  return utcDateTime < new Date();
};

/**
 * Format UTC datetime for display with custom options and timezone info
 * This function should be used for displaying stored UTC values.
 */
export const formatDisplayDateTime = (
  utcDate: string, 
  utcTime: string, 
  userTimezone?: string,
  options?: {
    showDate?: boolean;
    showTime?: boolean;
    showTimezone?: boolean;
    format12Hour?: boolean;
  }
): string => {
  const { showDate = true, showTime = true, showTimezone = false, format12Hour = false } = options || {};
  const { localDate, localTime } = convertFromUTC(utcDate, utcTime, userTimezone);
  const tz = userTimezone || getUserTimezone();
  
  let result = '';
  
  if (showDate) {
    // Re-create Date object based on localDate string to use proper formatting for the date part
    const date = new Date(localDate); 
    // Format date string from localDate (YYYY-MM-DD)
    result += new Date(`${localDate}T00:00:00`).toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      timeZone: tz // Use timezone for correct display logic
    });
  }
  
  if (showTime) {
    if (showDate) result += ' at ';
    
    // Use formatDateTimeForDisplay's logic for time formatting, but need a full datetime object
    const { timeString } = formatDateTimeForDisplay(localDate, localTime, tz);
    
    if (format12Hour) {
      // Use the output of formatDateTimeForDisplay for 12-hour format
      result += timeString; 
    } else {
      // 24-hour format
      result += localTime;
    }
  }
  
  if (showTimezone) {
    // Using the 'offset' format for clarity in this utility
    const tzName = getTimezoneDisplayName(tz, 'offset'); 
    result += ` (${tzName})`;
  }
  
  return result;
};

/**
 * Validate timezone
 */
export const isValidTimezone = (timezone: string): boolean => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
};

/**
 * Get common timezones for selection
 */
export const getCommonTimezones = () => [
  { value: 'Africa/Cairo', label: 'Cairo (UTC+2)' },
  { value: 'Asia/Riyadh', label: 'Riyadh (UTC+3)' },
  { value: 'Asia/Dubai', label: 'Dubai (UTC+4)' },
  { value: 'Asia/Kuwait', label: 'Kuwait (UTC+3)' },
  { value: 'Asia/Baghdad', label: 'Baghdad (UTC+3)' },
  { value: 'Europe/London', label: 'London (UTC+0/+1)' },
  { value: 'Europe/Paris', label: 'Paris (UTC+1/+2)' },
  { value: 'America/New_York', label: 'New York (UTC-5/-4)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (UTC-8/-7)' },
  { value: 'America/Chicago', label: 'Chicago (UTC-6/-5)' },
  { value: 'Australia/Sydney', label: 'Sydney (UTC+10/+11)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (UTC+9)' },
  { value: 'Asia/Singapore', label: 'Singapore (UTC+8)' },
];

// Example usage and testing
export const testTimezoneConversion = () => {
  console.log('=== Timezone Conversion Test ===');
  
  // Test case: Class scheduled for 6 PM Cairo time on Sept 14, 2025
  const localDate = '2025-09-14';
  const localTime = '18:00';
  const cairoTz = 'Africa/Cairo';
  
  console.log(`Original: ${localDate} ${localTime} in ${cairoTz}`);
  
  // Convert to UTC for storage
  const { utcDate, utcTime, utcDateTime } = convertToUTC(localDate, localTime, cairoTz);
  console.log(`Stored in DB (UTC): ${utcDate} ${utcTime}`);
  
  // Convert back to different timezones for display
  const timezones = [
    { tz: 'Africa/Cairo', name: 'Cairo' },
    { tz: 'Asia/Riyadh', name: 'Riyadh' },
    { tz: 'America/New_York', name: 'New York' },
  ];
  
  timezones.forEach(({ tz, name }) => {
    const { localDate: displayDate, localTime: displayTime } = convertFromUTC(utcDate, utcTime, tz);
    console.log(`${name}: ${displayDate} ${displayTime}`);
    console.log(`${name} (Formatted): ${formatDisplayDateTime(utcDate, utcTime, tz, { showTimezone: true, format12Hour: true })}`);
  });

  console.log(`\nLocal Current Time (${getTimezoneDisplayName(undefined, 'short')}):`, getCurrentLocalDateTime());
};