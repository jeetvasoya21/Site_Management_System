/**
 * Lunar Holiday Calculator
 * Detects Purnima (Full Moon) and Amavasya (New Moon) dates
 * Workers observe holidays on these lunar dates
 */

// Reference new moon: January 11, 2024 at 11:57 UTC
const KNOWN_NEW_MOON = new Date('2024-01-11T11:57:00Z');

// Mean synodic month (new moon to new moon) in days
const SYNODIC_MONTH = 29.530588853;

/**
 * Returns the lunar age (days since last new moon) for a given date.
 * Range: [0, ~29.53)
 */
export function getLunarAge(date) {
  const d = typeof date === 'string' ? new Date(date + 'T12:00:00Z') : new Date(date);
  const diffMs = d.getTime() - KNOWN_NEW_MOON.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return ((diffDays % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
}

/**
 * Returns true if the date falls on or within ±1.5 days of Amavasya (New Moon).
 */
export function isAmavasya(date) {
  const age = getLunarAge(date);
  return age < 1.5 || age > SYNODIC_MONTH - 1.5;
}

/**
 * Returns true if the date falls on or within ±1.5 days of Purnima (Full Moon).
 */
export function isPurnima(date) {
  const age = getLunarAge(date);
  const fullMoonAge = SYNODIC_MONTH / 2; // ~14.765
  return Math.abs(age - fullMoonAge) < 1.5;
}

/**
 * Returns true if the date is a lunar holiday (either Purnima or Amavasya).
 */
export function isLunarHoliday(date) {
  return isAmavasya(date) || isPurnima(date);
}

/**
 * Returns the holiday type string for a date, or null if not a holiday.
 */
export function getLunarHolidayType(date) {
  if (isAmavasya(date)) return 'Amavasya';
  if (isPurnima(date)) return 'Purnima';
  return null;
}

/**
 * Returns an array of lunar holiday dates for a given month (year, month 0-indexed).
 * Each entry: { date: 'YYYY-MM-DD', type: 'Purnima' | 'Amavasya' }
 *
 * To avoid returning multiple consecutive days for the same moon phase,
 * we find the day closest to the exact new moon or full moon moment.
 */
export function getLunarHolidaysForMonth(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const holidays = [];

  // Find exact new moon and full moon moments within ±15 days of this month
  // Strategy: scan days, find local minima of distance to phase 0 and phase 14.765
  const fullMoonAge = SYNODIC_MONTH / 2;

  let bestNewMoon = null;
  let bestNewMoonDist = 99;
  let bestFullMoon = null;
  let bestFullMoonDist = 99;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const age = getLunarAge(dateStr);

    // Distance from new moon (phase 0): handle wrap-around
    const distNew = Math.min(age, SYNODIC_MONTH - age);
    if (distNew < bestNewMoonDist) {
      bestNewMoonDist = distNew;
      bestNewMoon = { date: dateStr, dist: distNew };
    }

    // Distance from full moon (phase ~14.765)
    const distFull = Math.abs(age - fullMoonAge);
    if (distFull < bestFullMoonDist) {
      bestFullMoonDist = distFull;
      bestFullMoon = { date: dateStr, dist: distFull };
    }
  }

  // Only include if the closest day is within 2 days of that phase
  if (bestNewMoon && bestNewMoonDist < 2) {
    holidays.push({ date: bestNewMoon.date, type: 'Amavasya' });
  }
  if (bestFullMoon && bestFullMoonDist < 2) {
    holidays.push({ date: bestFullMoon.date, type: 'Purnima' });
  }

  return holidays.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Returns all lunar holidays for a given year as { date, type } objects.
 */
export function getLunarHolidaysForYear(year) {
  const all = [];
  for (let m = 0; m < 12; m++) {
    all.push(...getLunarHolidaysForMonth(year, m));
  }
  return all;
}
