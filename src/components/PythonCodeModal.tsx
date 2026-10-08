import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  FileCode, 
  Download, 
  CheckCircle2, 
  Terminal
} from 'lucide-react';
import { generatePythonProject } from '../data/pythonScriptTemplate';

interface PythonCodeModalProps {
  botToken: string;
  channelId: string;
  signature: string;
}

export const PythonCodeModal: React.FC<PythonCodeModalProps> = ({
  botToken,
  channelId,
  signature,
}) => {
  const projectFiles = generatePythonProject(botToken, channelId, signature);
  const fileKeys = Object.keys(projectFiles) as (keyof typeof projectFiles)[];
  const [activeFile, setActiveFile] = useState<keyof typeof projectFiles>('main.py');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(projectFiles[activeFile]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([projectFiles[activeFile]], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = activeFile;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-white dark:bg-[#131f37] rounded-2xl border border-sky-100 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-sky-100 dark:border-slate-800 bg-gradient-to-r from-sky-50/70 via-blue-50/40 to-transparent dark:from-slate-800/60 dark:via-slate-800/20 dark:to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                پروژه ماژولار پایتون (Pyrogram + Bot API)
              </h2>
              <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                ۱۰۰٪ Asynchronous
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              پیاده‌سازی مطابق الزامات فنی: دریافت پیام‌ها با Pyrogram و ارسال با Telegram Bot API
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'کپی شد!' : 'کپی فایل جاری'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>دانلود این فایل</span>
          </button>
        </div>
      </div>

      {/* Technical architecture banner */}
      <div className="bg-sky-50/50 dark:bg-slate-900/50 p-4 border-b border-sky-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="flex items-start gap-2 bg-white/80 dark:bg-slate-850/80 p-2.5 rounded-xl border border-sky-100 dark:border-slate-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-200">دریافت با Pyrogram</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">شنود ایونت‌ها، دستورات ادمین و مانیتورینگ ناهمگام کانال</p>
          </div>
        </div>
        <div className="flex items-start gap-2 bg-white/80 dark:bg-slate-850/80 p-2.5 rounded-xl border border-sky-100 dark:border-slate-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-200">ارسال با Telegram Bot API</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">ارسال پیام‌های فرمت‌شده HTML با کلاینت aiohttp غیرهمزمان</p>
          </div>
        </div>
        <div className="flex items-start gap-2 bg-white/80 dark:bg-slate-850/80 p-2.5 rounded-xl border border-sky-100 dark:border-slate-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-200">معماری کاملاً ماژولار</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">تفکیک تنظیمات، هسته ارسال، دریافت، تولید فال و زمانبند</p>
          </div>
        </div>
      </div>

      {/* File Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto p-2 bg-slate-900 border-b border-slate-800 scrollbar-none text-xs">
        {fileKeys.map((fname) => (
          <button
            key={fname}
            onClick={() => setActiveFile(fname)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs transition-colors whitespace-nowrap cursor-pointer ${
              activeFile === fname
                ? 'bg-sky-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{fname}</span>
          </button>
        ))}
      </div>

      {/* Code Viewer */}
      <div className="relative bg-slate-950 p-4 font-mono text-xs text-slate-200 max-h-96 overflow-y-auto dir-ltr text-left">
        <pre className="leading-relaxed whitespace-pre font-mono">
          {projectFiles[activeFile]}
        </pre>
      </div>

      {/* Quick Setup instructions footer */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-slate-300">دستور اجرای پروژه در سرور یا لینوکس:</span>
          <code className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded font-mono dir-ltr">
            pip install -r requirements.txt && python main.py
          </code>
        </div>
        <span className="text-sky-700 dark:text-sky-400 font-medium">توکن و کانال ({channelId || '@freeapiai'}) در کد لحاظ شده است</span>
      </div>
    </div>
  );
};
