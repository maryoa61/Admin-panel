export interface BotConfig {
  botToken: string;
  channelId: string;
  signature: string;
  botUsername?: string;
  botFirstName?: string;
  channelTitle?: string;
  channelMembersCount?: number;
  isConnected: boolean;
  channelConnected: boolean;
  silentNotification: boolean;
  disableWebPagePreview: boolean;
  defaultTimeZone: string;
}

export type FalCategory = 'all' | 'hafez' | 'daily' | 'energy' | 'motivation';

export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'once';

export interface TimeZoneOption {
  value: string;
  label: string;
  offset: string;
  city: string;
}

export const SUPPORTED_TIMEZONES: TimeZoneOption[] = [
  { value: 'Asia/Tehran', label: 'تهران (ایران)', offset: 'UTC+3:30', city: 'Tehran' },
  { value: 'Asia/Dubai', label: 'دبی (امارات)', offset: 'UTC+4:00', city: 'Dubai' },
  { value: 'Asia/Kabul', label: 'کابل (افغانستان)', offset: 'UTC+4:30', city: 'Kabul' },
  { value: 'Asia/Istanbul', label: 'استانبول (ترکیه)', offset: 'UTC+3:00', city: 'Istanbul' },
  { value: 'UTC', label: 'ساعت جهانی (UTC)', offset: 'UTC+0:00', city: 'UTC' },
  { value: 'Europe/London', label: 'لندن (بریتانیا)', offset: 'UTC+1:00', city: 'London' },
  { value: 'Europe/Berlin', label: 'برلین / پاریس (اروپای مرکزی)', offset: 'UTC+2:00', city: 'Berlin' },
  { value: 'America/New_York', label: 'نیویورک (شرق آمریکا)', offset: 'UTC-4:00', city: 'New York' },
  { value: 'America/Los_Angeles', label: 'لس‌آنجلس (غرب آمریکا)', offset: 'UTC-7:00', city: 'Los Angeles' },
];

export interface FalItem {
  id: string;
  title: string;
  category: FalCategory;
  poem?: string[];
  interpretation: string;
  advice: string;
  omen: string;
  luckyColor?: string;
  luckyNumber?: number;
}

export interface ScheduleItem {
  id: string;
  title: string;
  category: FalCategory;
  recurrenceType: RecurrenceType; // 'daily' | 'weekly' | 'monthly' | 'once'
  times: string[]; // e.g. ["09:00", "21:00"]
  weeklyDays?: number[]; // 6=Saturday, 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday
  monthlyDays?: number[]; // 1 to 31
  specificDate?: string; // YYYY-MM-DD for 'once'
  timeZone: string; // e.g. 'Asia/Tehran'
  isActive: boolean;
  lastRun?: string;
  nextRun?: string;
  totalSent: number;
  customNote?: string;
}

export interface MessageLog {
  id: string;
  timestamp: string;
  status: 'success' | 'failed' | 'pending';
  channelId: string;
  falTitle: string;
  messagePreview: string;
  telegramMessageId?: number;
  errorMessage?: string;
  scheduleTitle?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
