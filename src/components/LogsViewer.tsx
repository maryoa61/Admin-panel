import React from 'react';
import { 
  History, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trash2, 
  ExternalLink,
  Send,
  AlertCircle
} from 'lucide-react';
import { MessageLog } from '../types/telegram';

interface LogsViewerProps {
  logs: MessageLog[];
  onClearLogs: () => Promise<void>;
}

export const LogsViewer: React.FC<LogsViewerProps> = ({
  logs,
  onClearLogs,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-sky-100 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-sky-100 bg-gradient-to-r from-sky-50/70 via-blue-50/40 to-transparent flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800">
              تاریخچه و گزارش ارسال‌ها
            </h3>
            <p className="text-[11px] text-slate-500">
              ثبت تمام درخواست‌های ارسال موفق و خطاهای احتمالی تلگرام
            </p>
          </div>
        </div>

        {logs.length > 0 && (
          <button
            onClick={onClearLogs}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>پاکسازی لاگ‌ها</span>
          </button>
        )}
      </div>

      {/* Logs Table / List */}
      <div className="divide-y divide-sky-50">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs sm:text-sm">
            هنوز پیامی ارسال نشده است. به محض ارسال اولین پست، گزارش آن در اینجا ثبت می‌شود.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 sm:p-4 hover:bg-sky-50/30 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Status Icon */}
                <div className="mt-0.5 shrink-0">
                  {log.status === 'success' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  )}
                  {log.status === 'failed' && (
                    <XCircle className="w-4 h-4 text-rose-500" />
                  )}
                  {log.status === 'pending' && (
                    <Clock className="w-4 h-4 text-amber-500" />
                  )}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-800 text-xs sm:text-sm">
                      {log.falTitle}
                    </span>
                    <span className="text-[11px] font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 dir-ltr">
                      {log.channelId}
                    </span>
                    {log.telegramMessageId && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        ID: #{log.telegramMessageId}
                      </span>
                    )}
                  </div>

                  <p className="text-slate-500 truncate text-[11px]">
                    {log.messagePreview}
                  </p>

                  {log.errorMessage && (
                    <p className="text-rose-500 text-[11px] flex items-center gap-1 font-medium bg-rose-50/60 p-1.5 rounded-lg border border-rose-100">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{log.errorMessage}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Timestamp & Status Badge */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end shrink-0 text-slate-400 font-mono text-[11px]">
                <span className="dir-ltr">{log.timestamp}</span>
                {log.status === 'success' && (
                  <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    ارسال شد
                  </span>
                )}
                {log.status === 'failed' && (
                  <span className="px-2 py-0.5 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                    خطا
                  </span>
                )}
                {log.status === 'pending' && (
                  <span className="px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                    در انتظار
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
