import React, { useState, useEffect } from 'react';
import { 
  FileCode, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Globe2, 
  Eye,
  CheckCircle2
} from 'lucide-react';

export const StandaloneExportCard: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/telegram-admin.html')
      .then(res => res.text())
      .then(text => {
        setHtmlContent(text);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = 'telegram-auto-admin.html';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-[#131f37] rounded-2xl border border-sky-100 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-sky-100 dark:border-slate-800 bg-gradient-to-r from-sky-50/70 via-blue-50/40 to-transparent dark:from-slate-800/60 dark:via-slate-800/20 dark:to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-lg">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                کل پروژه در قالب یک فایل HTML مستقل (Standalone)
              </h2>
              <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                تک‌فایل آماده اجرا
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              بدون نیاز به سرور یا Node.js؛ تنها با دوبار کلیک روی فایل در مرورگر اجرا می‌شود
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          <a
            href="/telegram-admin.html"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>مشاهده در تب جدید</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-50 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-slate-700 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'کپی شد!' : 'کپی کل کد HTML'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>دانلود فایل HTML</span>
          </button>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-3.5 bg-sky-50/30 dark:bg-slate-900/40 border-b border-sky-100 dark:border-slate-800 text-xs">
        <div className="bg-white dark:bg-slate-800/80 p-3.5 rounded-xl border border-sky-100 dark:border-slate-700/80 space-y-1">
          <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>۱۰۰٪ خودکفا و سبک</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
            شامل تمامی استایل‌ها (Tailwind)، فونت وزیرمتن، جاوااسکریپت، و موتور زمانبندی در یک فایل واحد.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800/80 p-3.5 rounded-xl border border-sky-100 dark:border-slate-700/80 space-y-1">
          <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>اتصال مستقیم به تلگرام</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
            ارسال مستقیم پیام‌ها به پروتکل رسمی Telegram Bot API همراه با تست اعتبار توکن و بررسی دسترسی کانال.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800/80 p-3.5 rounded-xl border border-sky-100 dark:border-slate-700/80 space-y-1">
          <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>دیتابیس فال و زمانبند پس‌زمینه</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
            حاوی ده‌ها شعر اصیل حافظ و فال روزانه و ذخیره‌سازی داده‌ها در حافظه محلی مرورگر (LocalStorage).
          </p>
        </div>
      </div>

      {/* Code Preview Box */}
      <div className="p-4 bg-slate-950 font-mono text-xs text-slate-200 dir-ltr text-left max-h-96 overflow-y-auto">
        <pre className="whitespace-pre">
          {loading ? 'در حال بارگذاری فایل HTML...' : htmlContent.slice(0, 3500) + '\n\n... (ادامه فایل کامل در نسخه دانلود شده موجود است)'}
        </pre>
      </div>

      {/* Footer note */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          💡 راهنما: فایل دانلود شده را می‌توانید روی هر هاست، سرور استاتیک یا حتی به صورت لوکال با مرورگر اجرا کنید.
        </span>
        <button
          onClick={handleDownload}
          className="text-sky-600 dark:text-sky-400 font-bold hover:underline cursor-pointer"
        >
          دانلود مستقیم telegram-auto-admin.html
        </button>
      </div>
    </div>
  );
};
