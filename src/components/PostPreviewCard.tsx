import React, { useState } from 'react';
import { 
  Send, 
  RefreshCw, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Share2, 
  Eye, 
  CheckCheck,
  Moon,
  Sun,
  ShieldCheck
} from 'lucide-react';
import { FalItem, FalCategory } from '../types/telegram';

interface PostPreviewCardProps {
  fal: FalItem;
  formattedHtml: string;
  channelId: string;
  signature: string;
  onRefreshSample: (category?: FalCategory) => void;
  onSendInstant: () => Promise<void>;
  sending: boolean;
  isConnected: boolean;
}

export const PostPreviewCard: React.FC<PostPreviewCardProps> = ({
  fal,
  channelId,
  signature,
  onRefreshSample,
  onSendInstant,
  sending,
  isConnected,
}) => {
  const [telegramDark, setTelegramDark] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedCat, setSelectedCat] = useState<FalCategory>('all');

  const cleanSignature = signature.trim().startsWith('@') 
    ? signature.trim() 
    : `@${signature.trim()}`;

  const handleCopy = () => {
    // Generate clean text representation
    let text = `✨ ${fal.title} ✨\n\n`;
    if (fal.poem) {
      text += `📜 «شعر و غزل»\n${fal.poem.join('\n')}\n\n`;
    }
    text += `🔮 تعبیر و فال:\n${fal.interpretation}\n\n`;
    text += `💡 پند و توصیه:\n${fal.advice}\n\n`;
    text += `🌟 طالع: ${fal.omen}\n`;
    if (fal.luckyColor) {
      text += `🎨 رنگ شانس: ${fal.luckyColor} | 🔢 عدد شانس: ${fal.luckyNumber}\n`;
    }
    text += `\n━━━━━━━━━━━━━━━━━━━━\n📢 کانال تلگرام: ${cleanSignature}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCategoryChange = (cat: FalCategory) => {
    setSelectedCat(cat);
    onRefreshSample(cat);
  };

  const currentTime = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white rounded-2xl border border-sky-100 shadow-xs overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-sky-100 bg-gradient-to-r from-sky-50/70 via-blue-50/40 to-transparent flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800">
              پیش‌نمایش زنده پست تلگرام
            </h3>
            <p className="text-[11px] text-slate-500">
              طراحی مطابق حباب پیام تلگرام با امضای اختصاصی {cleanSignature}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Category filter */}
          <select
            value={selectedCat}
            onChange={(e) => handleCategoryChange(e.target.value as FalCategory)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 outline-none focus:border-sky-500"
          >
            <option value="all">🎲 فال تصادفی</option>
            <option value="hafez">📜 فال حافظ</option>
            <option value="daily">☀️ فال روزانه</option>
            <option value="energy">⚡ انرژی مثبت</option>
            <option value="motivation">🔥 انگیزشی</option>
          </select>

          {/* Telegram Dark/Light mode toggle */}
          <button
            onClick={() => setTelegramDark(!telegramDark)}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            title={telegramDark ? 'نمایش تم روشن تلگرام' : 'نمایش تم تاریک تلگرام'}
          >
            {telegramDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Refresh sample */}
          <button
            onClick={() => onRefreshSample(selectedCat)}
            className="p-1.5 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-lg transition-colors"
            title="تولید یک فال دیگر"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Realistic Telegram Bubble Canvas */}
      <div className={`p-4 sm:p-6 transition-colors flex-1 flex flex-col justify-center ${telegramDark ? 'bg-[#0f172a]' : 'bg-[#e7ebf0]'}`}>
        <div className="max-w-md mx-auto w-full">
          {/* Telegram Message Bubble */}
          <div
            className={`rounded-2xl p-4 sm:p-5 shadow-sm border transition-all text-right relative ${
              telegramDark
                ? 'bg-[#1e293b] text-slate-100 border-slate-800'
                : 'bg-white text-slate-800 border-slate-200/80 shadow-slate-200/50'
            }`}
          >
            {/* Channel header inside telegram bubble */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-dashed border-sky-100/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  FA
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-bold ${telegramDark ? 'text-sky-300' : 'text-sky-800'}`}>
                      کانال {channelId || '@freeapiai'}
                    </span>
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
                  </div>
                </div>
              </div>
              <span className={`text-[10px] ${telegramDark ? 'text-slate-400' : 'text-slate-400'}`}>
                کانال تلگرام
              </span>
            </div>

            {/* Post Content */}
            <div className="space-y-3 text-xs sm:text-sm leading-relaxed">
              <div className="text-center pb-1">
                <span className={`inline-block font-extrabold text-sm sm:text-base ${telegramDark ? 'text-sky-400' : 'text-sky-700'}`}>
                  ✨ {fal.title} ✨
                </span>
              </div>

              {/* Poem block if available */}
              {fal.poem && fal.poem.length > 0 && (
                <div
                  className={`p-3 rounded-xl border space-y-1.5 ${
                    telegramDark
                      ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                      : 'bg-sky-50/70 border-sky-100 text-slate-700'
                  }`}
                >
                  <p className="text-[11px] font-bold text-sky-600 mb-1">📜 «شعر و غزل»</p>
                  {fal.poem.map((line, idx) => (
                    <p key={idx} className="font-serif text-xs sm:text-sm text-center italic">
                      🔹 {line}
                    </p>
                  ))}
                </div>
              )}

              {/* Interpretation */}
              <div>
                <p className={`font-bold mb-0.5 text-xs ${telegramDark ? 'text-sky-300' : 'text-sky-800'}`}>
                  🔮 تعبیر و فال:
                </p>
                <p className={`${telegramDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {fal.interpretation}
                </p>
              </div>

              {/* Advice */}
              <div>
                <p className={`font-bold mb-0.5 text-xs ${telegramDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  💡 پند و توصیه:
                </p>
                <p className={`${telegramDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {fal.advice}
                </p>
              </div>

              {/* Omen and lucky info */}
              <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                <span className={`px-2 py-0.5 rounded-md font-semibold ${
                  telegramDark ? 'bg-amber-950/60 text-amber-300 border border-amber-800' : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  🌟 طالع: {fal.omen}
                </span>

                {fal.luckyColor && (
                  <span className={`px-2 py-0.5 rounded-md ${
                    telegramDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                  }`}>
                    🎨 رنگ: {fal.luckyColor}
                  </span>
                )}
                {fal.luckyNumber && (
                  <span className={`px-2 py-0.5 rounded-md font-mono ${
                    telegramDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                  }`}>
                    🔢 عدد: {fal.luckyNumber}
                  </span>
                )}
              </div>

              {/* Footer Signature */}
              <div className="pt-2 border-t border-slate-200/50 mt-3 text-center">
                <div className={`text-xs font-bold ${telegramDark ? 'text-sky-400' : 'text-sky-600'}`}>
                  📢 <span>کانال تلگرام: </span>
                  <a
                    href={`https://t.me/${cleanSignature.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:opacity-80 dir-ltr inline-block"
                  >
                    {cleanSignature}
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Meta (Time & Views) */}
            <div className={`mt-3 pt-2 flex items-center justify-between text-[11px] ${telegramDark ? 'text-slate-400' : 'text-slate-400'}`}>
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span className="font-mono">1.4K</span>
              </div>
              <div className="flex items-center gap-1 font-mono">
                <span>{currentTime}</span>
                <CheckCheck className="w-3.5 h-3.5 text-sky-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-sky-50/40 border-t border-sky-100 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'کپی شد!' : 'کپی متن پیام'}</span>
        </button>

        <button
          onClick={onSendInstant}
          disabled={sending || !isConnected}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-xs ${
            isConnected
              ? 'bg-sky-600 hover:bg-sky-700 active:scale-95 shadow-sky-600/20'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Send className={`w-4 h-4 ${sending ? 'animate-spin' : ''}`} />
          <span>{sending ? 'در حال ارسال به تلگرام...' : 'ارسال تستی فوری به کانال'}</span>
        </button>
      </div>
    </div>
  );
};
