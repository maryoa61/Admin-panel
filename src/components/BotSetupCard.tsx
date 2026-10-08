import React, { useState } from 'react';
import { 
  Key, 
  Send, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Sparkles,
  Radio,
  ExternalLink
} from 'lucide-react';
import { BotConfig, SUPPORTED_TIMEZONES } from '../types/telegram';

interface BotSetupCardProps {
  config: BotConfig;
  onUpdateConfig: (updated: Partial<BotConfig>) => Promise<void>;
  onTestBot: () => Promise<{ success: boolean; message: string }>;
  onTestChannel: () => Promise<{ success: boolean; message: string }>;
}

export const BotSetupCard: React.FC<BotSetupCardProps> = ({
  config,
  onUpdateConfig,
  onTestBot,
  onTestChannel,
}) => {
  const [showToken, setShowToken] = useState(false);
  const [testingBot, setTestingBot] = useState(false);
  const [testingChannel, setTestingChannel] = useState(false);
  const [botTestResult, setBotTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [channelTestResult, setChannelTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const handleTestBot = async () => {
    setTestingBot(true);
    setBotTestResult(null);
    try {
      const res = await onTestBot();
      setBotTestResult(res);
    } finally {
      setTestingBot(false);
    }
  };

  const handleTestChannel = async () => {
    setTestingChannel(true);
    setChannelTestResult(null);
    try {
      const res = await onTestChannel();
      setChannelTestResult(res);
    } finally {
      setTestingChannel(false);
    }
  };

  const copyChannelId = () => {
    navigator.clipboard.writeText(config.channelId);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-[#131f37] rounded-2xl border border-sky-100 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-sky-50/70 via-blue-50/40 to-transparent dark:from-slate-800/60 dark:via-slate-800/20 dark:to-transparent p-5 sm:p-6 border-b border-sky-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                تنظیمات ربات و کانال تلگرام
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                اتصال مستقیم به Telegram Bot API جهت ارسال خودکار فال
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 bg-sky-50 dark:bg-slate-800 hover:bg-sky-100/70 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>راهنمای ساخت ربات و توکن</span>
            {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expandable Step-by-Step Guide */}
        {showGuide && (
          <div className="mt-4 pt-4 border-t border-sky-100/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/70 p-4 rounded-xl text-xs text-slate-600 dark:text-slate-300 space-y-2.5">
            <p className="font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
              مراحل ساده ۳ گانه برای اتصال:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-slate-300 mr-1 leading-relaxed">
              <li>
                در تلگرام به آیدی <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-sky-600 dark:text-sky-400 font-semibold underline">@BotFather</a> پیام دهید و دستور <code className="bg-sky-50 dark:bg-slate-800 text-sky-700 dark:text-sky-300 px-1 py-0.5 rounded dir-ltr font-mono">/newbot</code> را بفرستید.
              </li>
              <li>
                یک نام و یک یوزرنیم برای ربات خود انتخاب کرده و <b>توکن دریافتی (HTTP API Token)</b> را در کادر زیر قرار دهید.
              </li>
              <li>
                ربات خود را در کانال <code className="bg-sky-50 dark:bg-slate-800 text-sky-700 dark:text-sky-300 px-1 py-0.5 rounded font-mono dir-ltr">{config.channelId || '@freeapiai'}</code> به عنوان <b>ادمین (Administrator)</b> با دسترسی ارسال پیام (Post Messages) اضافه کنید.
              </li>
            </ol>
          </div>
        )}
      </div>

      {/* Form Body */}
      <div className="p-5 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Bot Token Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <span>توکن ربات تلگرام (Bot Token)</span>
                <span className="text-rose-500">*</span>
              </label>
              {config.isConnected && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> متصل: @{config.botUsername}
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={config.botToken}
                onChange={(e) => onUpdateConfig({ botToken: e.target.value })}
                placeholder="مثال: 7123456789:AAF_xxxxxxx..."
                className="w-full pl-24 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-950 text-xs sm:text-sm font-mono dir-ltr outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
              <div className="absolute left-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title={showToken ? 'مخفی کردن' : 'نمایش توکن'}
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleTestBot}
                  disabled={testingBot || !config.botToken}
                  className="px-2.5 py-1 text-xs font-semibold bg-sky-50 dark:bg-slate-800 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors border border-sky-200/60 dark:border-slate-700"
                >
                  {testingBot ? 'تست...' : 'تست توکن'}
                </button>
              </div>
            </div>

            {botTestResult && (
              <p
                className={`text-xs flex items-center gap-1.5 ${
                  botTestResult.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
                }`}
              >
                {botTestResult.success ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{botTestResult.message}</span>
              </p>
            )}
          </div>

          {/* Target Channel ID */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <span>آیدی کانال تلگرام (Target Channel)</span>
                <span className="text-rose-500">*</span>
              </label>
              {config.channelConnected && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> تأیید شده
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                value={config.channelId}
                onChange={(e) => onUpdateConfig({ channelId: e.target.value })}
                placeholder="@freeapiai یا -100xxxxxxxx"
                className="w-full pl-24 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-950 text-xs sm:text-sm font-mono dir-ltr outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
              <div className="absolute left-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={copyChannelId}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="کپی آیدی"
                >
                  {copiedToken ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleTestChannel}
                  disabled={testingChannel || !config.botToken || !config.channelId}
                  className="px-2.5 py-1 text-xs font-semibold bg-sky-50 dark:bg-slate-800 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors border border-sky-200/60 dark:border-slate-700"
                >
                  {testingChannel ? 'بررسی...' : 'بررسی کانال'}
                </button>
              </div>
            </div>

            {channelTestResult && (
              <p
                className={`text-xs flex items-center gap-1.5 ${
                  channelTestResult.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
                }`}
              >
                {channelTestResult.success ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{channelTestResult.message}</span>
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Signature and Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Post Signature */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between">
              <span>امضای انتهای پست (Footer Signature)</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">نمایش در زیر هر فال</span>
            </label>
            <input
              type="text"
              value={config.signature}
              onChange={(e) => onUpdateConfig({ signature: e.target.value })}
              placeholder="@freeapiai"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-950 text-xs sm:text-sm font-mono dir-ltr outline-none transition-all"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              این امضا در انتهای هر پیام قرار گرفته و به کانال تلگرام شما لینک می‌شود.
            </p>
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                منطقه زمانی پیش‌فرض سیستم (Time Zone)
              </label>
            </div>
            <select
              value={config.defaultTimeZone || 'Asia/Tehran'}
              onChange={(e) => onUpdateConfig({ defaultTimeZone: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:border-sky-500 text-xs outline-none font-sans"
            >
              {SUPPORTED_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label} ({tz.offset})
                </option>
              ))}
            </select>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-50/70 dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-900 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 select-none flex-1">
                <input
                  type="checkbox"
                  checked={config.silentNotification}
                  onChange={(e) => onUpdateConfig({ silentNotification: e.target.checked })}
                  className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                />
                <span>ارسال سایلنت (بدون صدا)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-50/70 dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-900 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 select-none flex-1">
                <input
                  type="checkbox"
                  checked={config.disableWebPagePreview}
                  onChange={(e) => onUpdateConfig({ disableWebPagePreview: e.target.checked })}
                  className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                />
                <span>غیرفعال‌سازی پیش‌نمایش لینک</span>
              </label>
            </div>
          </div>
        </div>

        {/* Live Channel Info Banner */}
        {config.channelConnected && (
          <div className="bg-sky-50/60 dark:bg-slate-800/60 border border-sky-100 dark:border-slate-700 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-sky-800 dark:text-sky-300">
              <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span><b>کانال متصل شده:</b> {config.channelTitle || config.channelId}</span>
              {config.channelMembersCount !== undefined && config.channelMembersCount > 0 && (
                <span className="text-slate-500 dark:text-slate-400 font-mono">({config.channelMembersCount.toLocaleString('fa-IR')} عضو)</span>
              )}
            </div>
            <a
              href={`https://t.me/${config.channelId.replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 font-semibold"
            >
              <span>مشاهده کانال در تلگرام</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
