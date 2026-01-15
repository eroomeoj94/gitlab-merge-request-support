/**
 * Formats a duration in days to a human-readable string.
 * @param days - Number of days (can be fractional)
 * @returns Formatted string like "2.5 days" or "12 hours"
 */
export function formatDuration(days: number): string {
  if (days <= 0 || !Number.isFinite(days)) {
    return '0 days';
  }

  // If less than 1 day, show hours
  if (days < 1) {
    const hours = Math.round(days * 24);
    if (hours < 1) {
      const minutes = Math.round(days * 24 * 60);
      return minutes <= 1 ? '< 1 hour' : `${minutes} minutes`;
    }
    return hours === 1 ? '1 hour' : `${hours} hours`;
  }

  // Show days with 1 decimal place
  const rounded = Math.round(days * 10) / 10;
  return rounded === 1 ? '1 day' : `${rounded.toFixed(1)} days`;
}
