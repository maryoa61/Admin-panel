import { ScheduleItem } from '../types/telegram';

export interface ZonedParts {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hours: number; // 0-23
  minutes: number; // 0-59
  seconds: number; // 0-59
  dayOfWeek: number; // 0-6 (0 is Sunday, 6 is Saturday)
}

export const PERSIAN_WEEKDAYS = [
  { id: 6, label: 'شنبه', short: 'ش' },
  { id: 0, label: 'یکشنبه', short: 'ی' },
  { id: 1, label: 'دوشنبه', short: 'د' },
  { id: 2, label: 'سه‌شنبه', short: 'س' },
  { id: 3, label: 'چهارشنبه', short: 'چ' },
  { id: 4, label: 'پنج‌شنبه', short: 'پ' },
  { id: 5, label: 'جمعه', short: 'ج' },
];

export function getZonedDateParts(date: Date, timeZone: string = 'Asia/Tehran'): ZonedParts {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    weekday: 'short',
    hour12: false,
  });

  const parts = dtf.formatToParts(date);
  const partMap: Record<string, string> = {};
  for (const p of parts) {
    partMap[p.type] = p.value;
  }

  // Calculate dayOfWeek (0: Sun, 1: Mon, ..., 6: Sat)
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const hours = parseInt(partMap.hour, 10) === 24 ? 0 : parseInt(partMap.hour, 10);

  return {
    year: parseInt(partMap.year, 10),
    month: parseInt(partMap.month, 10),
    day: parseInt(partMap.day, 10),
    hours,
    minutes: parseInt(partMap.minute, 10),
    seconds: parseInt(partMap.second, 10),
    dayOfWeek: weekdayMap[partMap.weekday] ?? date.getDay(),
  };
}

export function formatCurrentTimeInZone(timeZone: string = 'Asia/Tehran'): string {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date());
  } catch {
    return new Date().toLocaleTimeString('fa-IR');
  }
}

export function calculateNextRun(schedule: ScheduleItem): string {
  const tz = schedule.timeZone || 'Asia/Tehran';
  const now = new Date();
  const current = getZonedDateParts(now, tz);
  const currentTotalMins = current.hours * 60 + current.minutes;

  const times = (schedule.times || ['09:00']).slice().sort();

  // 1. ONCE / FUTURE DATE
  if (schedule.recurrenceType === 'once') {
    if (!schedule.specificDate) return 'تاریخ مشخص نشده است';
    const [tYear, tMonth, tDay] = schedule.specificDate.split('-').map(Number);
    const targetTime = times[0] || '10:00';
    const [tHour, tMin] = targetTime.split(':').map(Number);

    const isPast =
      tYear < current.year ||
      (tYear === current.year && tMonth < current.month) ||
      (tYear === current.year && tMonth === current.month && tDay < current.day) ||
      (tYear === current.year && tMonth === current.month && tDay === current.day && (tHour * 60 + tMin) <= currentTotalMins);

    if (isPast) {
      return 'انجام شده / گذشته';
    }

    if (tYear === current.year && tMonth === current.month && tDay === current.day) {
      return `امروز ساعت ${targetTime}`;
    }

    return `${schedule.specificDate} ساعت ${targetTime}`;
  }

  // 2. DAILY
  if (schedule.recurrenceType === 'daily') {
    // Check if any time today is still ahead
    for (const t of times) {
      const [h, m] = t.split(':').map(Number);
      if (h * 60 + m > currentTotalMins) {
        return `امروز ساعت ${t}`;
      }
    }
    return `فردا ساعت ${times[0]}`;
  }

  // 3. WEEKLY
  if (schedule.recurrenceType === 'weekly') {
    const days = schedule.weeklyDays && schedule.weeklyDays.length > 0 ? schedule.weeklyDays : [6]; // default Saturday
    const currentDay = current.dayOfWeek;

    // Check today if today is an active day
    if (days.includes(currentDay)) {
      for (const t of times) {
        const [h, m] = t.split(':').map(Number);
        if (h * 60 + m > currentTotalMins) {
          return `امروز ساعت ${t}`;
        }
      }
    }

    // Find next day in the future week
    for (let offset = 1; offset <= 7; offset++) {
      const nextDay = (currentDay + offset) % 7;
      if (days.includes(nextDay)) {
        const dayLabel = PERSIAN_WEEKDAYS.find(w => w.id === nextDay)?.label || 'روز آینده';
        return `${dayLabel} ساعت ${times[0]}`;
      }
    }

    return `هفته آینده ساعت ${times[0]}`;
  }

  // 4. MONTHLY
  if (schedule.recurrenceType === 'monthly') {
    const mDays = schedule.monthlyDays && schedule.monthlyDays.length > 0 ? schedule.monthlyDays.slice().sort((a,b) => a - b) : [1];
    
    // Check if today is in monthlyDays and time is ahead
    if (mDays.includes(current.day)) {
      for (const t of times) {
        const [h, m] = t.split(':').map(Number);
        if (h * 60 + m > currentTotalMins) {
          return `امروز (روز ${current.day} ماه) ساعت ${t}`;
        }
      }
    }

    // Find next day in current month
    for (const d of mDays) {
      if (d > current.day) {
        return `روز ${d} همین ماه ساعت ${times[0]}`;
      }
    }

    // Else first day of next month
    return `روز ${mDays[0]} ماه آینده ساعت ${times[0]}`;
  }

  return `به زودی (${times[0]})`;
}

export function isScheduleDue(schedule: ScheduleItem, now: Date): boolean {
  if (!schedule.isActive) return false;

  const tz = schedule.timeZone || 'Asia/Tehran';
  const current = getZonedDateParts(now, tz);
  const currentTimeStr = `${String(current.hours).padStart(2, '0')}:${String(current.minutes).padStart(2, '0')}`;
  const currentDateStr = `${current.year}-${String(current.month).padStart(2, '0')}-${String(current.day).padStart(2, '0')}`;

  const times = schedule.times || ['09:00'];
  if (!times.includes(currentTimeStr)) {
    return false;
  }

  // Check last run to avoid duplicate execution in the same minute
  if (schedule.lastRun) {
    const lastRunDate = new Date(schedule.lastRun);
    const lastParts = getZonedDateParts(lastRunDate, tz);
    if (
      lastParts.year === current.year &&
      lastParts.month === current.month &&
      lastParts.day === current.day &&
      lastParts.hours === current.hours &&
      lastParts.minutes === current.minutes
    ) {
      return false;
    }
  }

  if (schedule.recurrenceType === 'once') {
    return schedule.specificDate === currentDateStr;
  }

  if (schedule.recurrenceType === 'daily') {
    return true;
  }

  if (schedule.recurrenceType === 'weekly') {
    const days = schedule.weeklyDays && schedule.weeklyDays.length > 0 ? schedule.weeklyDays : [6];
    return days.includes(current.dayOfWeek);
  }

  if (schedule.recurrenceType === 'monthly') {
    const mDays = schedule.monthlyDays && schedule.monthlyDays.length > 0 ? schedule.monthlyDays : [1];
    return mDays.includes(current.day);
  }

  return false;
}
