import React from 'react';
import { Bot, Send, Sparkles, Moon, Sun } from 'lucide-react';
import { BotConfig } from '../types/telegram';

interface HeaderProps {
  config: BotConfig;
  onSendInstantTest: () => void;
  sendingTest: boolean;
  activeSchedulesCount: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onSendInstantTest,
  sendingTest,
  activeSchedulesCount,
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="border-b border-sky-100 dark:border-slate-800/80 bg-white/85 dark:bg-[#0f172a]/85 backdrop-blur-md sticky top-0 z-30 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 ring-2 ring-sky-200/50 dark:ring-sky-500/30">
                  <Bot className="w-6 h-6" />
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                    config.isConnected && config.channelConnected
                      ? 'bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900'
                      : config.isConnected
                      ? 'bg-amber-500'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                  title={config.isConnected ? 'ربات متصل است' : 'ربات غیرفعال'}
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                    ادمین هوشمند تلگرام
                  </h1>
                  <span className="bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 text-xs px-2 py-0.5 rounded-full font-semibold border border-sky-200/60 dark:border-sky-800 hidden sm:inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-sky-500 dark:text-sky-400" /> نسخه خودکار
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  سیستم ارسال خودکار و زمانبندی شده فال روزانه به کانال
                </p>
              </div>
            </div>

            {/* Mobile Actions: Dark toggle & Status Dot */}
            <div className="sm:hidden flex items-center gap-2">
              <button
                onClick={onToggleDarkMode}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title={isDarkMode ? 'تغییر به حالت روز' : 'تغییر به حالت شب'}
                aria-label="تغییر تم تاریک و روشن"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className={`w-2 h-2 rounded-full ${config.isConnected ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                <span>{config.isConnected ? 'متصل' : 'قطع'}</span>
              </div>
            </div>
          </div>

          {/* Quick status & Actions */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
            <div className="hidden md:flex items-center gap-2 bg-sky-50/70 dark:bg-slate-800/80 border border-sky-100 dark:border-slate-700/80 px-3 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-300">
              <span className="text-slate-400 dark:text-slate-400">کانال هدف:</span>
              <span className="font-semibold text-sky-700 dark:text-sky-300 dir-ltr">{config.channelId || '@freeapiai'}</span>
              <span className="w-1 h-1 rounded-full bg-sky-300 dark:bg-slate-600 mx-0.5" />
              <span className="text-slate-400 dark:text-slate-400">زمانبندی‌های فعال:</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">{activeSchedulesCount}</span>
            </div>

            {/* Desktop Global Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs cursor-pointer select-none"
              title={isDarkMode ? 'تغییر به حالت روز (روشن)' : 'تغییر به حالت شب (سرمه‌ای تیره)'}
              aria-label="تغییر تم تاریک و روشن"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
                  <span>حالت روز</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-sky-600 transition-transform -rotate-12 hover:rotate-0" />
                  <span>حالت شب</span>
                </>
              )}
            </button>

            <button
              onClick={onSendInstantTest}
              disabled={sendingTest || !config.isConnected}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs ${
                config.isConnected
                  ? 'bg-sky-600 hover:bg-sky-700 active:scale-95 text-white shadow-sky-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Send className={`w-4 h-4 ${sendingTest ? 'animate-spin' : ''}`} />
              <span>{sendingTest ? 'در حال ارسال...' : 'ارسال تست آنی فال'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
