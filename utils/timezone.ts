const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Extracts the hour (0-23) and day-of-week for a timestamp, in a fixed
 * timezone — rather than the server's own OS timezone (which on most cloud
 * instances defaults to UTC and won't match your users' local time).
 */
export function getZonedHourAndDay(
  timestamp: number,
  timeZone: string = "Asia/Kolkata"
): { hour: number; day: number } {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    hour12: false,
    weekday: "short",
  });

  const parts = formatter.formatToParts(new Date(timestamp));
  const hourPart = parts.find((p) => p.type === "hour")?.value;
  const weekdayPart = parts.find((p) => p.type === "weekday")?.value;

  // hour12:false formats midnight as "24" in some Node/ICU builds — normalize to 0.
  let hour = hourPart ? parseInt(hourPart, 10) : 0;
  if (hour === 24) hour = 0;

  const day = DAY_NAMES.indexOf(weekdayPart || "Sun");

  return { hour, day: day === -1 ? 0 : day };
}