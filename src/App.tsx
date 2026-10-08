import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Clock, 
  Sparkles, 
  History, 
  Terminal, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  X,
  ExternalLink,
  Shield,
  Layers,
  Settings,
  FileCode
} from 'lucide-react';

import { Header } from './components/Header';
import { BotSetupCard } from './components/BotSetupCard';
import { ScheduleManager } from './components/ScheduleManager';
import { PostPreviewCard } from './components/PostPreviewCard';
import { LogsViewer } from './components/LogsViewer';
import { PythonCodeModal } from './components/PythonCodeModal';
import { StandaloneExportCard } from './components/StandaloneExportCard';

import { BotConfig, ScheduleItem, MessageLog, FalItem, FalCategory } from './types/telegram';
import { getRandomFal, formatTelegramPost } from './data/falDatabase';

export default function App() {
  const [activeTab, setActiveTab] = useState<'setup' | 'schedule' | 'preview' | 'logs' | 'python' | 'html'>('setup');

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('telegram_admin_theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply dark mode class to HTML / Body and persist to localStorage
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('telegram_admin_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('telegram_admin_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const [config, setConfig] = useState<BotConfig>({
    botToken: '',
    channelId: '@freeapiai',
    signature: '@freeapiai',
    botUsername: '',
    botFirstName: '',
    channelTitle: 'Free API AI Channel',
    channelMembersCount: 0,
    isConnected: false,
    channelConnected: false,
    silentNotification: false,
    disableWebPagePreview: true,
    defaultTimeZone: 'Asia/Tehran',
  });

  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [currentFal, setCurrentFal] = useState<FalItem>(getRandomFal('all'));
  const [formattedPreview, setFormattedPreview] = useState<string>('');
  
  const [sendingInstant, setSendingInstant] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch initial data
  useEffect(() => {
    fetchConfig();
    fetchSchedules();
    fetchLogs();
  }, []);

  // Update preview whenever fal or signature changes
  useEffect(() => {
    const html = formatTelegramPost(currentFal, config.signature || '@freeapiai');
    setFormattedPreview(html);
  }, [currentFal, config.signature]);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      const json = await res.json();
      if (json.success && json.data) {
        setConfig(json.data);
      }
    } catch {
      // Local fallback
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await fetch('/api/schedules');
      const json = await res.json();
      if (json.success && json.data) {
        setSchedules(json.data);
      }
    } catch {
      // Local fallback
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const json = await res.json();
      if (json.success && json.data) {
        setLogs(json.data);
      }
    } catch {
      // Local fallback
    }
  };

  const handleUpdateConfig = async (updated: Partial<BotConfig>) => {
    const newConfig = { ...config, ...updated };
    setConfig(newConfig);

    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
    } catch {
      // ignore
    }
  };

  const handleTestBot = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/telegram/test-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: config.botToken }),
      });
      const data = await res.json();

      if (data.success) {
        setConfig(prev => ({
          ...prev,
          isConnected: true,
          botUsername: data.data.username,
          botFirstName: data.data.firstName,
        }));
        showToast(`✅ ربات با موفقیت تایید شد: @${data.data.username}`, 'success');
        return { success: true, message: `ربات با موفقیت متصل شد: @${data.data.username}` };
      } else {
        setConfig(prev => ({ ...prev, isConnected: false }));
        showToast(data.error || 'خطا در اعتبارسنجی توکن', 'error');
        return { success: false, message: data.error || 'خطا در اعتبارسنجی ربات' };
      }
    } catch (err: any) {
      return { success: false, message: `خطا در اتصال: ${err.message}` };
    }
  };

  const handleTestChannel = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/telegram/test-channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: config.botToken, channelId: config.channelId }),
      });
      const data = await res.json();

      if (data.success) {
        setConfig(prev => ({
          ...prev,
          channelConnected: true,
          channelTitle: data.data.title,
          channelMembersCount: data.data.membersCount,
        }));
        showToast(`✅ کانال ${data.data.title || config.channelId} تایید شد و ربات دسترسی دارد!`, 'success');
        return { success: true, message: `کانال متصل شد: ${data.data.title || config.channelId}` };
      } else {
        setConfig(prev => ({ ...prev, channelConnected: false }));
        showToast(data.error || 'خطا در اتصال به کانال', 'error');
        return { success: false, message: data.error || 'ربات به کانال دسترسی ندارد' };
      }
    } catch (err: any) {
      return { success: false, message: `خطا در بررسی کانال: ${err.message}` };
    }
  };

  const handleSendInstant = async () => {
    setSendingInstant(true);
    try {
      const res = await fetch('/api/telegram/send-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: config.botToken,
          channelId: config.channelId,
          signature: config.signature || '@freeapiai',
          category: currentFal.category,
        }),
      });

      const data = await res.json();
      await fetchLogs();

      if (data.success) {
        showToast(`🎉 فال با موفقیت در کانال ${config.channelId} پست شد!`, 'success');
      } else {
        showToast(data.error || 'خطا در ارسال پست به کانال', 'error');
      }
    } catch (err: any) {
      showToast(`خطای ارتباطی: ${err.message}`, 'error');
    } finally {
      setSendingInstant(false);
    }
  };

  const handleAddSchedule = async (sched: Omit<ScheduleItem, 'id' | 'totalSent'>) => {
    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sched),
      });
      const data = await res.json();
      if (data.success) {
        setSchedules(prev => [...prev, data.data]);
        showToast('برنامه زمانبندی با موفقیت افزوده شد.', 'success');
      }
    } catch {
      showToast('خطا در ذخیره زمانبندی', 'error');
    }
  };

  const handleToggleSchedule = async (id: string) => {
    try {
      const res = await fetch(`/api/schedules/${id}/toggle`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSchedules(prev => prev.map(s => (s.id === id ? data.data : s)));
      }
    } catch {
      // ignore
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      const res = await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSchedules(prev => prev.filter(s => s.id !== id));
        showToast('زمانبندی حذف شد.', 'info');
      }
    } catch {
      // ignore
    }
  };

  const handleClearLogs = async () => {
    try {
      await fetch('/api/logs/clear', { method: 'POST' });
      setLogs([]);
      showToast('تاریخچه لاگ‌ها پاکسازی شد.', 'info');
    } catch {
      // ignore
    }
  };

  const handleRefreshSample = (cat: FalCategory = 'all') => {
    const newFal = getRandomFal(cat);
    setCurrentFal(newFal);
  };

  const activeSchedulesCount = schedules.filter(s => s.isActive).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/60 via-slate-50 to-white dark:from-[#0b1329] dark:via-[#0e172e] dark:to-[#070c18] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 left-5 z-50 animate-bounce">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-semibold border ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/20'
                : toast.type === 'error'
                ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/20'
                : 'bg-sky-700 text-white border-sky-600 shadow-sky-700/20'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main App Header */}
      <Header
        config={config}
        onSendInstantTest={handleSendInstant}
        sendingTest={sendingInstant}
        activeSchedulesCount={activeSchedulesCount}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="bg-white dark:bg-[#131f37] p-1.5 rounded-2xl border border-sky-100 dark:border-slate-800 shadow-xs flex items-center justify-between overflow-x-auto scrollbar-none gap-1 transition-colors">
          <div className="flex items-center gap-1 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('setup')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-1 sm:flex-initial justify-center cursor-pointer ${
                activeTab === 'setup'
                  ? 'bg-sky-500 text-white shadow-xs shadow-sky-500/30'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-sky-50/70 dark:hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>اتصال ربات و کانال</span>
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-1 sm:flex-initial justify-center cursor-pointer ${
                activeTab === 'schedule'
                  ? 'bg-sky-500 text-white shadow-xs shadow-sky-500/30'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-sky-50/70 dark:hover:bg-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>زمانبندی ارسال فال</span>
              {activeSchedulesCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'schedule' ? 'bg-sky-700 text-white' : 'bg-sky-100 dark:bg-slate-700 text-sky-700 dark:text-sky-300'}`}>
                  {activeSchedulesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-1 sm:flex-initial justify-center cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-sky-500 text-white shadow-xs shadow-sky-500/30'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-sky-50/70 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>پیش‌نمایش زنده پست</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-1 sm:flex-initial justify-center cursor-pointer ${
                activeTab === 'logs'
                  ? 'bg-sky-500 text-white shadow-xs shadow-sky-500/30'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-sky-50/70 dark:hover:bg-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>گزارش‌ها و تاریخچه</span>
            </button>

            <button
              onClick={() => setActiveTab('python')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-1 sm:flex-initial justify-center cursor-pointer ${
                activeTab === 'python'
                  ? 'bg-sky-500 text-white shadow-xs shadow-sky-500/30'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-sky-50/70 dark:hover:bg-slate-800'
              }`}
            >
              <Terminal className="w-4 h-4 text-emerald-500" />
              <span>کد پایتون (Pyrogram)</span>
            </button>

            <button
              onClick={() => setActiveTab('html')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-1 sm:flex-initial justify-center cursor-pointer ${
                activeTab === 'html'
                  ? 'bg-sky-500 text-white shadow-xs shadow-sky-500/30'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-sky-50/70 dark:hover:bg-slate-800'
              }`}
            >
              <FileCode className="w-4 h-4 text-sky-500" />
              <span>نسخه تک‌فایل HTML</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Setup */}
        {activeTab === 'setup' && (
          <div className="space-y-6">
            <BotSetupCard
              config={config}
              onUpdateConfig={handleUpdateConfig}
              onTestBot={handleTestBot}
              onTestChannel={handleTestChannel}
            />

            {/* Quick action cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div
                onClick={() => setActiveTab('schedule')}
                className="bg-white dark:bg-[#131f37] p-5 rounded-2xl border border-sky-100 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-500 transition-all cursor-pointer group shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1">
                  تنظیم ساعات ارسال خودکار
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ساعات روزانه مانند ۰۸:۳۰ صبح یا ۲۱:۰۰ شب را مشخص کنید تا ربات سر ساعت به کانال پست بفرستد.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('preview')}
                className="bg-white dark:bg-[#131f37] p-5 rounded-2xl border border-sky-100 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-500 transition-all cursor-pointer group shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1">
                  مشاهده پیش‌نمایش و ارسال تست
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  دیدن فال‌های حافظ و روزانه در قالب حباب پیام تلگرام با امضای اختصاصی {config.signature || '@freeapiai'}.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('python')}
                className="bg-white dark:bg-[#131f37] p-5 rounded-2xl border border-sky-100 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-500 transition-all cursor-pointer group shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                  <Terminal className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1">
                  دریافت سورس کد پایتون
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ماژول‌های ناهمگام Pyrogram جهت شنود پیام‌ها و Telegram Bot API جهت ارسال خودکار روی سرور شخصی.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('html')}
                className="bg-white dark:bg-[#131f37] p-5 rounded-2xl border border-sky-100 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-500 transition-all cursor-pointer group shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                  <FileCode className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1">
                  نسخه تک‌فایل HTML
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  اجرای کل پروژه در قالب یک فایل HTML مستقل بدون نیاز به سرور و با اجرای مستقیم در مرورگر.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Scheduler */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <ScheduleManager
              schedules={schedules}
              defaultTimeZone={config.defaultTimeZone || 'Asia/Tehran'}
              onAddSchedule={handleAddSchedule}
              onToggleSchedule={handleToggleSchedule}
              onDeleteSchedule={handleDeleteSchedule}
            />
          </div>
        )}

        {/* Tab 3: Preview */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            <PostPreviewCard
              fal={currentFal}
              formattedHtml={formattedPreview}
              channelId={config.channelId}
              signature={config.signature}
              onRefreshSample={handleRefreshSample}
              onSendInstant={handleSendInstant}
              sending={sendingInstant}
              isConnected={config.isConnected}
            />
          </div>
        )}

        {/* Tab 4: Logs */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <LogsViewer
              logs={logs}
              onClearLogs={handleClearLogs}
            />
          </div>
        )}

        {/* Tab 5: Python Project (Pyrogram + Bot API) */}
        {activeTab === 'python' && (
          <div className="space-y-6">
            <PythonCodeModal
              botToken={config.botToken}
              channelId={config.channelId}
              signature={config.signature}
            />
          </div>
        )}

        {/* Tab 6: Standalone Single-File HTML */}
        {activeTab === 'html' && (
          <div className="space-y-6">
            <StandaloneExportCard />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-sky-100 dark:border-slate-800 bg-white/70 dark:bg-[#0f172a]/70 py-4 text-center text-xs text-slate-400 dark:text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <b>ادمین هوشمند تلگرام</b> — سامانه ارسال زمانبندی شده فال و محتوا به کانال {config.channelId || '@freeapiai'}
          </span>
          <span className="text-[11px] font-mono dir-ltr">
            Telegram Bot API & Pyrogram Async Architecture
          </span>
        </div>
      </footer>
    </div>
  );
}
