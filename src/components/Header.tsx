import React from 'react';
import { Bot, Send, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { BotConfig } from '../types/telegram';

interface HeaderProps {
  config: BotConfig;
  onSendInstantTest: () => void;
  sendingTest: boolean;
  activeSchedulesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onSendInstantTest,
  sendingTest,
  activeSchedulesCount,
}) => {
  return (
    <header className="border-b border-sky-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 ring-2 ring-sky-200/50">
                  <Bot className="w-6 h-6" />
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                    config.isConnected && config.channelConnected
                      ? 'bg-emerald-500 ring-2 ring-emerald-200'
                      : config.isConnected
                      ? 'bg-amber-500'
                      : 'bg-slate-300'
                  }`}
                  title={config.isConnected ? 'ربات متصل است' : 'ربات غیرفعال'}
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">
                    ادمین هوشمند تلگرام
                  </h1>
                  <span className="bg-sky-100 text-sky-700 text-xs px-2 py-0.5 rounded-full font-semibold border border-sky-200/60 hidden sm:inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-sky-500" /> نسخه خودکار
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  سیستم ارسال خودکار و زمانبندی شده فال روزانه به کانال
                </p>
              </div>
            </div>

            {/* Mobile Status Dot */}
            <div className="sm:hidden flex items-center gap-1.5 text-xs text-slate-500">
              <span className={`w-2 h-2 rounded-full ${config.isConnected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <span>{config.isConnected ? 'متصل' : 'قطع'}</span>
            </div>
          </div>

          {/* Quick status & Actions */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
            <div className="hidden md:flex items-center gap-2 bg-sky-50/70 border border-sky-100 px-3 py-1.5 rounded-xl text-xs text-slate-600">
              <span className="text-slate-400">کانال هدف:</span>
              <span className="font-semibold text-sky-700 dir-ltr">{config.channelId || '@freeapiai'}</span>
              <span className="w-1 h-1 rounded-full bg-sky-300 mx-0.5" />
              <span className="text-slate-400">زمانبندی‌های فعال:</span>
              <span className="font-bold text-slate-700">{activeSchedulesCount}</span>
            </div>

            <button
              onClick={onSendInstantTest}
              disabled={sendingTest || !config.isConnected}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs ${
                config.isConnected
                  ? 'bg-sky-600 hover:bg-sky-700 active:scale-95 text-white shadow-sky-600/20'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
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
