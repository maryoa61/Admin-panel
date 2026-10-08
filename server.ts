import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { FAL_DATABASE, getRandomFal, formatTelegramPost } from './src/data/falDatabase.ts';
import { BotConfig, ScheduleItem, MessageLog, FalCategory, SUPPORTED_TIMEZONES } from './src/types/telegram.ts';
import { calculateNextRun, isScheduleDue, formatCurrentTimeInZone } from './src/utils/schedulerUtils.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory application state
let botConfig: BotConfig = {
  botToken: process.env.TELEGRAM_BOT_TOKEN || '',
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
};

// Initial schedules demonstrating Daily, Weekly, Monthly, and Future Date
let schedules: ScheduleItem[] = [
  {
    id: 'sched-daily-1',
    title: 'فال روزانه صبحگاهی و شبانه',
    category: 'all',
    recurrenceType: 'daily',
    times: ['08:30', '21:00'],
    timeZone: 'Asia/Tehran',
    isActive: true,
    totalSent: 0,
    customNote: 'ارسال منظم روزانه در دو نوبت صبح و شامگاه',
  },
  {
    id: 'sched-weekly-1',
    title: 'فال حافظ ویژه آدینه (جمعه‌ها)',
    category: 'hafez',
    recurrenceType: 'weekly',
    times: ['10:00'],
    weeklyDays: [5], // Friday
    timeZone: 'Asia/Tehran',
    isActive: true,
    totalSent: 0,
    customNote: 'ارسال اختصاصی آخر هفته',
  },
  {
    id: 'sched-monthly-1',
    title: 'فال انرژی و برکت آغاز ماه',
    category: 'energy',
    recurrenceType: 'monthly',
    times: ['12:00'],
    monthlyDays: [1, 15], // 1st and 15th of month
    timeZone: 'Asia/Tehran',
    isActive: true,
    totalSent: 0,
    customNote: 'ارسال اول و نیمه هر ماه',
  },
  {
    id: 'sched-once-1',
    title: 'پست ویژه مناسبتی',
    category: 'motivation',
    recurrenceType: 'once',
    times: ['18:00'],
    specificDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10), // 3 days in future
    timeZone: 'Asia/Tehran',
    isActive: true,
    totalSent: 0,
    customNote: 'ارسال یک‌باره در تاریخ مشخص آینده',
  }
];

// Initialize nextRun for all
for (const s of schedules) {
  s.nextRun = calculateNextRun(s);
}

let logs: MessageLog[] = [
  {
    id: 'log-init',
    timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    status: 'pending',
    channelId: '@freeapiai',
    falTitle: 'آماده‌سازی سامانه ادمین هوشمند تلگرام',
    messagePreview: 'موتور پیشرفته زمانبندی روزانه، هفتگی، ماهانه و تاریخ آینده با پشتیبانی از چند منطقه‌زمانی آماده است.',
  }
];

// Helper: send Telegram Bot API call asynchronously
async function callTelegramApi(endpoint: string, token: string, body?: any) {
  const url = `https://api.telegram.org/bot${token}/${endpoint}`;
  const response = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  return data;
}

// API Routes
app.get('/api/config', (req: Request, res: Response) => {
  res.json({ success: true, data: botConfig });
});

app.post('/api/config', (req: Request, res: Response) => {
  const { botToken, channelId, signature, silentNotification, disableWebPagePreview, defaultTimeZone } = req.body;
  if (botToken !== undefined) botConfig.botToken = botToken.trim();
  if (channelId !== undefined) botConfig.channelId = channelId.trim();
  if (signature !== undefined) botConfig.signature = signature.trim();
  if (silentNotification !== undefined) botConfig.silentNotification = Boolean(silentNotification);
  if (disableWebPagePreview !== undefined) botConfig.disableWebPagePreview = Boolean(disableWebPagePreview);
  if (defaultTimeZone !== undefined) botConfig.defaultTimeZone = defaultTimeZone;

  res.json({ success: true, data: botConfig });
});

// Timezones info & live clocks
app.get('/api/timezones/live', (req: Request, res: Response) => {
  const liveTimes = SUPPORTED_TIMEZONES.map(tz => ({
    ...tz,
    currentTime: formatCurrentTimeInZone(tz.value),
  }));
  res.json({ success: true, data: liveTimes });
});

// Test Bot Token
app.post('/api/telegram/test-bot', async (req: Request, res: Response) => {
  try {
    const token = req.body.token || botConfig.botToken;
    if (!token) {
      return res.status(400).json({ success: false, error: 'لطفاً توکن ربات تلگرام را وارد کنید.' });
    }

    const data = await callTelegramApi('getMe', token);
    if (!data.ok) {
      botConfig.isConnected = false;
      return res.status(400).json({
        success: false,
        error: `خطای تلگرام: ${data.description || 'توکن نامعتبر است'}`
      });
    }

    botConfig.isConnected = true;
    botConfig.botUsername = data.result.username;
    botConfig.botFirstName = data.result.first_name;

    res.json({
      success: true,
      data: {
        id: data.result.id,
        username: data.result.username,
        firstName: data.result.first_name,
        canJoinGroups: data.result.can_join_groups,
      }
    });
  } catch (err: any) {
    botConfig.isConnected = false;
    res.status(500).json({ success: false, error: `خطا در ارتباط با سرور تلگرام: ${err.message}` });
  }
});

// Test Channel Permissions & Connection
app.post('/api/telegram/test-channel', async (req: Request, res: Response) => {
  try {
    const token = req.body.token || botConfig.botToken;
    let channelId = req.body.channelId || botConfig.channelId;

    if (!token) {
      return res.status(400).json({ success: false, error: 'ابتدا توکن ربات را وارد و ذخیره کنید.' });
    }
    if (!channelId) {
      return res.status(400).json({ success: false, error: 'لطفاً آیدی کانال را وارد کنید (مثال: @freeapiai)' });
    }

    if (!channelId.startsWith('@') && !channelId.startsWith('-100')) {
      channelId = `@${channelId}`;
    }

    // Call getChat
    const chatData = await callTelegramApi('getChat', token, { chat_id: channelId });
    if (!chatData.ok) {
      botConfig.channelConnected = false;
      return res.status(400).json({
        success: false,
        error: `عدم دسترسی به کانال: ${chatData.description}. دقت کنید ربات در کانال عضو شده و دسترسی ارسال پیام (Post Messages) داشته باشد.`
      });
    }

    botConfig.channelConnected = true;
    botConfig.channelTitle = chatData.result.title || channelId;
    
    // Check member count if available
    try {
      const countData = await callTelegramApi('getChatMemberCount', token, { chat_id: channelId });
      if (countData.ok) {
        botConfig.channelMembersCount = countData.result;
      }
    } catch {
      // ignore
    }

    res.json({
      success: true,
      data: {
        id: chatData.result.id,
        title: chatData.result.title,
        username: chatData.result.username,
        type: chatData.result.type,
        membersCount: botConfig.channelMembersCount,
      }
    });
  } catch (err: any) {
    botConfig.channelConnected = false;
    res.status(500).json({ success: false, error: `خطا در بررسی کانال: ${err.message}` });
  }
});

// Immediate Send Post
app.post('/api/telegram/send-post', async (req: Request, res: Response) => {
  const token = req.body.token || botConfig.botToken;
  let channelId = req.body.channelId || botConfig.channelId;
  const signature = req.body.signature || botConfig.signature || '@freeapiai';
  const category: FalCategory = req.body.category || 'all';
  const customText = req.body.customText;
  const scheduleTitle = req.body.scheduleTitle;

  if (!token) {
    return res.status(400).json({ success: false, error: 'توکن ربات تلگرام تنظیم نشده است.' });
  }
  if (!channelId) {
    return res.status(400).json({ success: false, error: 'آیدی کانال مشخص نشده است.' });
  }

  if (!channelId.startsWith('@') && !channelId.startsWith('-100')) {
    channelId = `@${channelId}`;
  }

  const falItem = getRandomFal(category);
  const postHtml = customText || formatTelegramPost(falItem, signature);

  try {
    const payload = {
      chat_id: channelId,
      text: postHtml,
      parse_mode: 'HTML',
      disable_web_page_preview: botConfig.disableWebPagePreview,
      disable_notification: botConfig.silentNotification,
    };

    const telegramRes = await callTelegramApi('sendMessage', token, payload);

    const logEntry: MessageLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: telegramRes.ok ? 'success' : 'failed',
      channelId,
      falTitle: falItem.title,
      scheduleTitle,
      messagePreview: falItem.interpretation.slice(0, 70) + '...',
      telegramMessageId: telegramRes.ok ? telegramRes.result.message_id : undefined,
      errorMessage: telegramRes.ok ? undefined : telegramRes.description,
    };

    logs.unshift(logEntry);
    if (logs.length > 60) logs.pop();

    if (!telegramRes.ok) {
      return res.status(400).json({
        success: false,
        error: `خطای ارسال تلگرام: ${telegramRes.description}`,
        log: logEntry
      });
    }

    res.json({
      success: true,
      data: {
        messageId: telegramRes.result.message_id,
        chat: telegramRes.result.chat,
        date: telegramRes.result.date,
        preview: postHtml,
        log: logEntry
      }
    });
  } catch (err: any) {
    const failedLog: MessageLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'failed',
      channelId,
      falTitle: falItem.title,
      scheduleTitle,
      messagePreview: falItem.interpretation.slice(0, 70) + '...',
      errorMessage: err.message,
    };
    logs.unshift(failedLog);
    res.status(500).json({ success: false, error: `خطا در برقراری تماس با تلگرام: ${err.message}` });
  }
});

// Schedules API
app.get('/api/schedules', (req: Request, res: Response) => {
  // refresh nextRun
  for (const s of schedules) {
    s.nextRun = calculateNextRun(s);
  }
  res.json({ success: true, data: schedules });
});

app.post('/api/schedules', (req: Request, res: Response) => {
  const {
    title,
    category,
    recurrenceType,
    times,
    weeklyDays,
    monthlyDays,
    specificDate,
    timeZone,
    customNote,
    isActive
  } = req.body;

  const newSchedule: ScheduleItem = {
    id: `sched-${Date.now()}`,
    title: title || 'زمانبندی هوشمند فال تلگرام',
    category: category || 'all',
    recurrenceType: recurrenceType || 'daily',
    times: times && times.length > 0 ? times : ['10:00'],
    weeklyDays: weeklyDays || [6],
    monthlyDays: monthlyDays || [1],
    specificDate: specificDate || '',
    timeZone: timeZone || botConfig.defaultTimeZone || 'Asia/Tehran',
    customNote: customNote || '',
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    totalSent: 0,
  };

  newSchedule.nextRun = calculateNextRun(newSchedule);
  schedules.push(newSchedule);
  res.json({ success: true, data: newSchedule });
});

app.put('/api/schedules/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = schedules.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'زمانبندی یافت نشد.' });
  }

  schedules[index] = { ...schedules[index], ...req.body };
  schedules[index].nextRun = calculateNextRun(schedules[index]);
  res.json({ success: true, data: schedules[index] });
});

app.delete('/api/schedules/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  schedules = schedules.filter(s => s.id !== id);
  res.json({ success: true, message: 'زمانبندی با موفقیت حذف شد.' });
});

app.post('/api/schedules/:id/toggle', (req: Request, res: Response) => {
  const { id } = req.params;
  const schedule = schedules.find(s => s.id === id);
  if (!schedule) {
    return res.status(404).json({ success: false, error: 'زمانبندی یافت نشد.' });
  }
  schedule.isActive = !schedule.isActive;
  schedule.nextRun = calculateNextRun(schedule);
  res.json({ success: true, data: schedule });
});

// Logs API
app.get('/api/logs', (req: Request, res: Response) => {
  res.json({ success: true, data: logs });
});

app.post('/api/logs/clear', (req: Request, res: Response) => {
  logs = [];
  res.json({ success: true, message: 'تاریخچه با موفقیت پاک شد.' });
});

// Sample Fal for preview
app.get('/api/fal/sample', (req: Request, res: Response) => {
  const category = (req.query.category as FalCategory) || 'all';
  const fal = getRandomFal(category);
  const signature = (req.query.signature as string) || botConfig.signature || '@freeapiai';
  const formattedHtml = formatTelegramPost(fal, signature);

  res.json({
    success: true,
    data: {
      fal,
      formattedHtml
    }
  });
});

// Background Asynchronous Scheduler Worker
setInterval(async () => {
  if (!botConfig.botToken || !botConfig.channelId) return;

  const now = new Date();

  for (const schedule of schedules) {
    if (!schedule.isActive) continue;

    if (isScheduleDue(schedule, now)) {
      schedule.lastRun = now.toISOString();
      schedule.totalSent += 1;

      // If one-off, deactivate after running
      if (schedule.recurrenceType === 'once') {
        schedule.isActive = false;
      }
      schedule.nextRun = calculateNextRun(schedule);

      try {
        const fal = getRandomFal(schedule.category);
        const text = formatTelegramPost(fal, botConfig.signature || '@freeapiai');

        const res = await callTelegramApi('sendMessage', botConfig.botToken, {
          chat_id: botConfig.channelId,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: botConfig.disableWebPagePreview,
        });

        logs.unshift({
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          status: res.ok ? 'success' : 'failed',
          channelId: botConfig.channelId,
          scheduleTitle: schedule.title,
          falTitle: `[زمانبند ${schedule.recurrenceType}] ${fal.title}`,
          messagePreview: fal.interpretation.slice(0, 70) + '...',
          telegramMessageId: res.ok ? res.result.message_id : undefined,
          errorMessage: res.ok ? undefined : res.description,
        });
      } catch (err: any) {
        logs.unshift({
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          status: 'failed',
          channelId: botConfig.channelId,
          scheduleTitle: schedule.title,
          falTitle: `[خطای زمانبند] ${schedule.title}`,
          messagePreview: 'خطا در ارسال زمانبندی شده فال',
          errorMessage: err.message,
        });
      }
    }
  }
}, 30000); // Check every 30s

// Mount Vite or serve static
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ادمین هوشمند تلگرام] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
