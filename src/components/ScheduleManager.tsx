import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Plus, 
  Trash2, 
  Calendar, 
  Sparkles, 
  Zap, 
  BookOpen, 
  Sun, 
  Flame,
  ToggleLeft,
  ToggleRight,
  Globe2,
  CalendarDays,
  Repeat,
  CalendarCheck,
  CheckCircle2,
  Info
} from 'lucide-react';
import { 
  ScheduleItem, 
  FalCategory, 
  RecurrenceType, 
  SUPPORTED_TIMEZONES 
} from '../types/telegram';
import { 
  PERSIAN_WEEKDAYS, 
  formatCurrentTimeInZone, 
  calculateNextRun 
} from '../utils/schedulerUtils';

interface ScheduleManagerProps {
  schedules: ScheduleItem[];
  defaultTimeZone: string;
  onAddSchedule: (schedule: Omit<ScheduleItem, 'id' | 'totalSent'>) => Promise<void>;
  onToggleSchedule: (id: string) => Promise<void>;
  onDeleteSchedule: (id: string) => Promise<void>;
}

export const ScheduleManager: React.FC<ScheduleManagerProps> = ({
  schedules,
  defaultTimeZone,
  onAddSchedule,
  onToggleSchedule,
  onDeleteSchedule,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterType, setFilterType] = useState<RecurrenceType | 'all'>('all');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<FalCategory>('all');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('daily');
  const [timeZone, setTimeZone] = useState(defaultTimeZone || 'Asia/Tehran');
  const [customNote, setCustomNote] = useState('');

  // Daily State
  const [timeInput, setTimeInput] = useState('09:00');
  const [dailyTimes, setDailyTimes] = useState<string[]>(['09:00']);

  // Weekly State
  const [weeklyDays, setWeeklyDays] = useState<number[]>([6, 5]); // Saturday and Friday
  const [weeklyTime, setWeeklyTime] = useState('10:00');

  // Monthly State
  const [monthlyDays, setMonthlyDays] = useState<number[]>([1, 15]);
  const [monthlyTime, setMonthlyTime] = useState('12:00');

  // Once / Future Date State
  const todayStr = new Date().toISOString().slice(0, 10);
  const [specificDate, setSpecificDate] = useState(todayStr);
  const [onceTime, setOnceTime] = useState('14:00');

  // Live clocks for the selected timezone
  const [liveZonedTime, setLiveZonedTime] = useState(formatCurrentTimeInZone(timeZone));

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveZonedTime(formatCurrentTimeInZone(timeZone));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeZone]);

  const handleAddDailyTime = () => {
    if (timeInput && !dailyTimes.includes(timeInput)) {
      setDailyTimes([...dailyTimes, timeInput].sort());
    }
  };

  const handleRemoveDailyTime = (t: string) => {
    setDailyTimes(dailyTimes.filter(item => item !== t));
  };

  const toggleWeeklyDay = (dayId: number) => {
    if (weeklyDays.includes(dayId)) {
      if (weeklyDays.length > 1) {
        setWeeklyDays(weeklyDays.filter(d => d !== dayId));
      }
    } else {
      setWeeklyDays([...weeklyDays, dayId]);
    }
  };

  const toggleMonthlyDay = (dayNum: number) => {
    if (monthlyDays.includes(dayNum)) {
      if (monthlyDays.length > 1) {
        setMonthlyDays(monthlyDays.filter(d => d !== dayNum));
      }
    } else {
      setMonthlyDays([...monthlyDays, dayNum].sort((a,b) => a - b));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let times: string[] = [];
    if (recurrenceType === 'daily') {
      times = dailyTimes.length > 0 ? dailyTimes : ['09:00'];
    } else if (recurrenceType === 'weekly') {
      times = [weeklyTime];
    } else if (recurrenceType === 'monthly') {
      times = [monthlyTime];
    } else if (recurrenceType === 'once') {
      times = [onceTime];
    }

    const payload: Omit<ScheduleItem, 'id' | 'totalSent'> = {
      title: title.trim() || `زمانبندی ${getRecurrenceName(recurrenceType)}`,
      category,
      recurrenceType,
      times,
      weeklyDays: recurrenceType === 'weekly' ? weeklyDays : undefined,
      monthlyDays: recurrenceType === 'monthly' ? monthlyDays : undefined,
      specificDate: recurrenceType === 'once' ? specificDate : undefined,
      timeZone,
      customNote: customNote.trim() || undefined,
      isActive: true,
    };

    await onAddSchedule(payload);

    setTitle('');
    setCustomNote('');
    setShowAddForm(false);
  };

  const getRecurrenceName = (type: RecurrenceType) => {
    switch (type) {
      case 'daily': return 'روزانه';
      case 'weekly': return 'هفتگی';
      case 'monthly': return 'ماهانه';
      case 'once': return 'تاریخ مشخص آینده';
    }
  };

  const getCategoryBadge = (cat: FalCategory) => {
    switch (cat) {
      case 'hafez':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-200/50 dark:border-amber-800">
            <BookOpen className="w-3 h-3" /> فال حافظ
          </span>
        );
      case 'daily':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-md border border-sky-200/50 dark:border-sky-800">
            <Sun className="w-3 h-3" /> فال روزانه
          </span>
        );
      case 'energy':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-800">
            <Zap className="w-3 h-3" /> انرژی مثبت
          </span>
        );
      case 'motivation':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md border border-purple-200/50 dark:border-purple-800">
            <Flame className="w-3 h-3" /> انگیزشی
          </span>
        );
      case 'all':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md border border-blue-200/50 dark:border-blue-800">
            <Sparkles className="w-3 h-3" /> ترکیبی
          </span>
        );
    }
  };

  const getRecurrenceBadge = (type: RecurrenceType) => {
    switch (type) {
      case 'daily':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-md border border-sky-200/60 dark:border-sky-800">
            <Repeat className="w-3 h-3" /> تکرار روزانه
          </span>
        );
      case 'weekly':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800">
            <CalendarDays className="w-3 h-3" /> تکرار هفتگی
          </span>
        );
      case 'monthly':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-md border border-teal-200/60 dark:border-teal-800">
            <CalendarCheck className="w-3 h-3" /> تکرار ماهانه
          </span>
        );
      case 'once':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800">
            <Calendar className="w-3 h-3" /> تاریخ آینده (یک‌باره)
          </span>
        );
    }
  };

  const filteredSchedules = schedules.filter(s => {
    if (filterType === 'all') return true;
    return s.recurrenceType === filterType;
  });

  return (
    <div className="bg-white dark:bg-[#131f37] rounded-2xl border border-sky-100 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-sky-100 dark:border-slate-800 bg-gradient-to-r from-sky-50/70 via-blue-50/40 to-transparent dark:from-slate-800/60 dark:via-slate-800/20 dark:to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                زمانبندی پیشرفته ارسال خودکار
              </h2>
              <span className="bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800 hidden sm:inline-block">
                چند منطقه‌زمانی
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              پشتیبانی از ارسال‌های روزانه، هفتگی، ماهانه و تاریخ‌های مشخص آینده با TimeZone اختصاصی
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-sky-600 hover:bg-sky-700 active:scale-95 text-white transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>تعریف زمانبندی جدید</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="px-5 py-2.5 bg-slate-50/70 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 dark:text-slate-500 font-medium text-[11px] ml-1">فیلتر نمایش:</span>
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            همه ({schedules.length})
          </button>
          <button
            onClick={() => setFilterType('daily')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              filterType === 'daily'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            روزانه ({schedules.filter(s => s.recurrenceType === 'daily').length})
          </button>
          <button
            onClick={() => setFilterType('weekly')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              filterType === 'weekly'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            هفتگی ({schedules.filter(s => s.recurrenceType === 'weekly').length})
          </button>
          <button
            onClick={() => setFilterType('monthly')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              filterType === 'monthly'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            ماهانه ({schedules.filter(s => s.recurrenceType === 'monthly').length})
          </button>
          <button
            onClick={() => setFilterType('once')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              filterType === 'once'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            تاریخ آینده ({schedules.filter(s => s.recurrenceType === 'once').length})
          </button>
        </div>

        {/* Live Clock Badge for Selected Default Zone */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-mono shrink-0">
          <Globe2 className="w-3.5 h-3.5 text-sky-500" />
          <span className="dir-ltr font-bold text-slate-700 dark:text-slate-200">{liveZonedTime}</span>
          <span className="text-slate-400 dark:text-slate-500">({timeZone.split('/')[1] || timeZone})</span>
        </div>
      </div>

      {/* Add New Schedule Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-5 bg-sky-50/50 dark:bg-slate-900/60 border-b border-sky-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              تعریف برنامه زمانبندی جدید
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            >
              انصراف
            </button>
          </div>

          {/* Row 1: Title, Category, TimeZone */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1">
                عنوان برنامه
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: فال حافظ آدینه"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-950 text-xs sm:text-sm outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1">
                موضوع فال
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FalCategory)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:border-sky-500 text-xs sm:text-sm outline-none"
              >
                <option value="all">🎲 ترکیبی (همه موضوعات)</option>
                <option value="hafez">📜 فال حافظ با غزل اصیل</option>
                <option value="daily">☀️ فال روزانه و طالع</option>
                <option value="energy">⚡ انرژی مثبت و شانس</option>
                <option value="motivation">🔥 انگیزشی و اراده</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1 flex items-center justify-between">
                <span>منطقه زمانی (TimeZone)</span>
                <span className="text-[10px] text-sky-600 dark:text-sky-400 font-mono dir-ltr">{liveZonedTime}</span>
              </label>
              <select
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:border-sky-500 text-xs sm:text-sm outline-none font-sans"
              >
                {SUPPORTED_TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label} - {tz.offset}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Recurrence Type Segmented Tabs */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1.5">
              نوع تکرار زمانبندی
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setRecurrenceType('daily')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  recurrenceType === 'daily'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>تکرار روزانه (Daily)</span>
              </button>

              <button
                type="button"
                onClick={() => setRecurrenceType('weekly')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  recurrenceType === 'weekly'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>تکرار هفتگی (Weekly)</span>
              </button>

              <button
                type="button"
                onClick={() => setRecurrenceType('monthly')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  recurrenceType === 'monthly'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>تکرار ماهانه (Monthly)</span>
              </button>

              <button
                type="button"
                onClick={() => setRecurrenceType('once')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  recurrenceType === 'once'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>تاریخ معین آینده (Once)</span>
              </button>
            </div>
          </div>

          {/* Conditional Recurrence Settings */}
          {/* 1. Daily Settings */}
          {recurrenceType === 'daily' && (
            <div className="bg-white dark:bg-slate-900/80 p-3.5 rounded-xl border border-sky-100 dark:border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block">
                ساعات ارسال روزانه (می‌توانید چند نوبت در طول شبانه‌روز تعیین کنید)
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="time"
                  value={timeInput}
                  onChange={(e) => setTimeInput(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono text-xs dir-ltr outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddDailyTime}
                  className="px-3 py-1.5 bg-sky-100 dark:bg-slate-800 text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  + افزودن این ساعت
                </button>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 mr-auto">
                  <span>پیش‌فرض سریع:</span>
                  <button
                    type="button"
                    onClick={() => setDailyTimes(['08:30', '13:30', '21:00'])}
                    className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    صبح، ظهر، شب
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {dailyTimes.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-sky-800 dark:text-sky-300 px-2 py-0.5 rounded-md text-xs font-mono font-bold"
                  >
                    <Clock className="w-3 h-3 text-sky-500" />
                    <span>{t}</span>
                    {dailyTimes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDailyTime(t)}
                        className="text-slate-400 hover:text-rose-500 ml-1 cursor-pointer"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 2. Weekly Settings */}
          {recurrenceType === 'weekly' && (
            <div className="bg-white dark:bg-slate-900/80 p-3.5 rounded-xl border border-sky-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block">
                  انتخاب روزهای هفته جهت ارسال
                </label>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setWeeklyDays([6, 0, 1, 2, 3])}
                    className="text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    روزهای کاری
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <button
                    type="button"
                    onClick={() => setWeeklyDays([4, 5])}
                    className="text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    آخر هفته (پنجشنبه و جمعه)
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <button
                    type="button"
                    onClick={() => setWeeklyDays([5])}
                    className="text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    فقط جمعه
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {PERSIAN_WEEKDAYS.map((w) => {
                  const isSelected = weeklyDays.includes(w.id);
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => toggleWeeklyDay(w.id)}
                      className={`p-2 rounded-xl text-center text-xs font-bold transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="block text-[10px] opacity-80">{w.short}</span>
                      <span>{w.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">ساعت ارسال در روزهای انتخابی:</span>
                <input
                  type="time"
                  value={weeklyTime}
                  onChange={(e) => setWeeklyTime(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono text-xs dir-ltr outline-none"
                />
              </div>
            </div>
          )}

          {/* 3. Monthly Settings */}
          {recurrenceType === 'monthly' && (
            <div className="bg-white dark:bg-slate-900/80 p-3.5 rounded-xl border border-sky-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block">
                  انتخاب روزهای ماه (۱ تا ۳۱)
                </label>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setMonthlyDays([1])}
                    className="text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    اول ماه
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <button
                    type="button"
                    onClick={() => setMonthlyDays([1, 15])}
                    className="text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    اول و نیمه ماه
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <button
                    type="button"
                    onClick={() => setMonthlyDays([30])}
                    className="text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    پایان ماه
                  </button>
                </div>
              </div>

              {/* 31 days grid */}
              <div className="grid grid-cols-7 sm:grid-cols-11 gap-1">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
                  const isSelected = monthlyDays.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleMonthlyDay(d)}
                      className={`p-1.5 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">ساعت ارسال در روزهای ماه:</span>
                <input
                  type="time"
                  value={monthlyTime}
                  onChange={(e) => setMonthlyTime(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono text-xs dir-ltr outline-none"
                />
              </div>
            </div>
          )}

          {/* 4. Once / Future Date Settings */}
          {recurrenceType === 'once' && (
            <div className="bg-white dark:bg-slate-900/80 p-3.5 rounded-xl border border-sky-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-1.5 text-xs text-sky-800 dark:text-sky-300 font-bold">
                <Info className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>تعیین یک تاریخ و ساعت مشخص در آینده (ارسال یک‌باره)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1">
                    تاریخ ارسال (میلادی YYYY-MM-DD)
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={specificDate}
                    onChange={(e) => setSpecificDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono text-xs dir-ltr outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1">
                    ساعت ارسال در تاریخ بالا
                  </label>
                  <input
                    type="time"
                    value={onceTime}
                    onChange={(e) => setOnceTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono text-xs dir-ltr outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Optional Note */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1">
              یادداشت یا توضیحات (اختیاری)
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="مثال: پست ویژه تبریک آخر هفته"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-xs cursor-pointer"
            >
              ذخیره و فعال‌سازی برنامه
            </button>
          </div>
        </form>
      )}

      {/* Schedules List */}
      <div className="divide-y divide-sky-50 dark:divide-slate-800/80">
        {filteredSchedules.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs sm:text-sm">
            هیچ زمانبندی‌ای با فیلتر انتخابی یافت نشد. با دکمه بالا یک برنامه جدید بسازید.
          </div>
        ) : (
          filteredSchedules.map((item) => {
            const nextRunFormatted = calculateNextRun(item);
            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                  item.isActive ? 'hover:bg-sky-50/30 dark:hover:bg-slate-800/40' : 'bg-slate-50/60 dark:bg-slate-900/40 opacity-70'
                }`}
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                      {item.title}
                    </h4>
                    {getRecurrenceBadge(item.recurrenceType)}
                    {getCategoryBadge(item.category)}
                    {item.isActive ? (
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        فعال
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                        غیرفعال
                      </span>
                    )}
                  </div>

                  {item.customNote && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.customNote}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    {/* Time & Trigger Info */}
                    <span className="flex items-center gap-1 font-mono text-sky-700 dark:text-sky-300 font-semibold bg-sky-50 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-sky-100 dark:border-slate-700">
                      <Clock className="w-3.5 h-3.5 text-sky-500" />
                      {item.times.join(' ، ')}
                    </span>

                    {/* Specific details */}
                    {item.recurrenceType === 'weekly' && item.weeklyDays && (
                      <span className="text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-800 text-[11px]">
                        روزهای:{' '}
                        {item.weeklyDays
                          .map((d) => PERSIAN_WEEKDAYS.find((w) => w.id === d)?.label)
                          .filter(Boolean)
                          .join(' ، ')}
                      </span>
                    )}

                    {item.recurrenceType === 'monthly' && item.monthlyDays && (
                      <span className="text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-100 dark:border-teal-800 text-[11px]">
                        روزهای ماه: {item.monthlyDays.join(' ، ')}
                      </span>
                    )}

                    {item.recurrenceType === 'once' && item.specificDate && (
                      <span className="text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-100 dark:border-amber-800 text-[11px] font-mono dir-ltr">
                        {item.specificDate}
                      </span>
                    )}

                    {/* Timezone */}
                    <span className="text-slate-400 dark:text-slate-400 flex items-center gap-1 text-[11px]">
                      <Globe2 className="w-3 h-3 text-slate-400" />
                      <span>{item.timeZone.split('/')[1] || item.timeZone}</span>
                    </span>

                    {/* Next Run */}
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      نوبت بعدی: <b className="text-sky-700 dark:text-sky-400">{nextRunFormatted}</b>
                    </span>

                    {item.totalSent > 0 && (
                      <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                        ارسال شده: <b>{item.totalSent}</b> بار
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => onToggleSchedule(item.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      item.isActive
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 border border-amber-200/60 dark:border-amber-800'
                        : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200/60 dark:border-emerald-800'
                    }`}
                    title={item.isActive ? 'توقف موقت زمانبندی' : 'فعال‌سازی مجدد'}
                  >
                    {item.isActive ? (
                      <>
                        <ToggleRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>فعال (توقف)</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <span>غیرفعال (شروع)</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onDeleteSchedule(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                    title="حذف زمانبندی"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
