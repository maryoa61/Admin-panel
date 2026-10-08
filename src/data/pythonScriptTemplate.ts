export interface PythonProjectFiles {
  'main.py': string;
  'config.py': string;
  'bot_sender.py': string;
  'telegram_receiver.py': string;
  'scheduler_service.py': string;
  'fal_engine.py': string;
  'requirements.txt': string;
  'README.md': string;
}

export function generatePythonProject(botToken: string, channelId: string, signature: string): PythonProjectFiles {
  const token = botToken || 'YOUR_BOT_TOKEN_HERE';
  const channel = channelId || '@freeapiai';
  const sig = signature || '@freeapiai';

  const configPy = `# -*- coding: utf-8 -*-
"""
ماژول پیکربندی پیشرفته (Advanced Configuration Module)
پشتیبانی از انواع زمانبندی روزانه، هفتگی، ماهانه، تاریخ آینده و منطقه‌های زمانی مختلف
"""
import os

# اطلاعات اتصال ربات و کانال تلگرام
BOT_TOKEN = os.getenv("BOT_TOKEN", "${token}")
CHANNEL_ID = os.getenv("CHANNEL_ID", "${channel}")
CHANNEL_SIGNATURE = os.getenv("CHANNEL_SIGNATURE", "${sig}")

# منطقه زمانی پیش‌فرض سیستم (Time Zone)
# نمونه‌ها: 'Asia/Tehran', 'Asia/Dubai', 'UTC', 'Europe/London', 'America/New_York'
DEFAULT_TIMEZONE = os.getenv("TIMEZONE", "Asia/Tehran")

# مشخصات تلگرام برای کلاینت ناهمگام Pyrogram (جهت شنود و دریافت پیام‌ها)
API_ID = int(os.getenv("TELEGRAM_API_ID", "1234567"))
API_HASH = os.getenv("TELEGRAM_API_HASH", "your_telegram_api_hash_here")

# تنظیمات زمانبندی پیشرفته (Advanced Schedules Definition)
SCHEDULE_CONFIGS = [
    # ۱. زمانبندی روزانه (Daily): هر روز در ساعات مشخص
    {
        "id": "daily_morning_night",
        "type": "daily",
        "hours": ["08:30", "21:00"],
        "category": "all",
        "timezone": DEFAULT_TIMEZONE,
        "description": "فال روزانه در دو نوبت صبح و شامگاه"
    },
    # ۲. زمانبندی هفتگی (Weekly): روزهای جمعه ساعت ۱۰:۰۰ صبح
    {
        "id": "weekly_friday",
        "type": "weekly",
        "days_of_week": ["fri"],  # mon, tue, wed, thu, fri, sat, sun
        "hours": ["10:00"],
        "category": "hafez",
        "timezone": DEFAULT_TIMEZONE,
        "description": "فال حافظ ویژه آدینه"
    },
    # ۳. زمانبندی ماهانه (Monthly): روز اول و پانزدهم هر ماه ساعت ۱۲:۰۰
    {
        "id": "monthly_blessing",
        "type": "monthly",
        "days_of_month": [1, 15],
        "hours": ["12:00"],
        "category": "energy",
        "timezone": DEFAULT_TIMEZONE,
        "description": "فال انرژی مثبت در روزهای اول و نیمه ماه"
    },
    # ۴. تاریخ مشخص آینده (Specific Future Date - One Time)
    {
        "id": "special_event_once",
        "type": "once",
        "run_date": "2026-10-15 18:00:00",
        "category": "motivation",
        "timezone": DEFAULT_TIMEZONE,
        "description": "پست ویژه مناسبتی در تاریخی معین"
    }
]
`;

  const botSenderPy = `# -*- coding: utf-8 -*-
"""
ماژول ارسال ناهمگام پیام‌ها با استفاده از Telegram Bot API (aiohttp)
"""
import aiohttp
import logging
from typing import Optional, Dict, Any
from config import BOT_TOKEN, CHANNEL_ID

logger = logging.getLogger("BotSender")

class TelegramBotSender:
    """کلاینت کاملاً غیرهمزمان (Async) جهت ارسال محتوا با پروتکل HTTP رسمی تلگرام"""
    
    def __init__(self, token: Optional[str] = None):
        self.token = token or BOT_TOKEN
        self.base_url = f"https://api.telegram.org/bot{self.token}"

    async def get_me(self) -> Dict[str, Any]:
        """اعتبارسنجی توکن ربات"""
        async with aiohttp.ClientSession() as session:
            url = f"{self.base_url}/getMe"
            async with session.get(url, timeout=10) as resp:
                data = await resp.json()
                if not data.get("ok"):
                    raise RuntimeError(f"خطای توکن تلگرام: {data.get('description')}")
                return data["result"]

    async def send_message(
        self, 
        text: str, 
        target_chat: Optional[str] = None, 
        parse_mode: str = "HTML",
        disable_web_page_preview: bool = True
    ) -> Dict[str, Any]:
        """ارسال پیام به کانال تلگرام"""
        chat = target_chat or CHANNEL_ID
        payload = {
            "chat_id": chat,
            "text": text,
            "parse_mode": parse_mode,
            "disable_web_page_preview": disable_web_page_preview
        }
        
        async with aiohttp.ClientSession() as session:
            url = f"{self.base_url}/sendMessage"
            async with session.post(url, json=payload, timeout=15) as resp:
                data = await resp.json()
                if not data.get("ok"):
                    logger.error(f"❌ خطا در ارسال به {chat}: {data.get('description')}")
                    raise RuntimeError(f"خطای تلگرام: {data.get('description')}")
                
                logger.info(f"✅ پیام به کانال {chat} ارسال شد. شناسه پیام: {data['result']['message_id']}")
                return data["result"]
`;

  const schedulerServicePy = `# -*- coding: utf-8 -*-
"""
ماژول پیشرفته زمانبندی ناهمگام با APScheduler و پشتیبانی از TimeZone
شامل زمانبندی روزانه (Daily)، هفتگی (Weekly)، ماهانه (Monthly) و تاریخ مشخص (Once)
"""
import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.date import DateTrigger
from config import SCHEDULE_CONFIGS, CHANNEL_ID
from bot_sender import TelegramBotSender
from fal_engine import generate_fal_post

logger = logging.getLogger("SchedulerService")
sender = TelegramBotSender()

async def execute_scheduled_post(category: str, schedule_desc: str):
    """تابع اجرایی هنگام رسیدن موعد زمانبندی"""
    try:
        logger.info(f"⏳ زمان اجرای: {schedule_desc}...")
        content = generate_fal_post(category)
        await sender.send_message(content, target_chat=CHANNEL_ID)
        logger.info(f"🎉 پست با موفقیت به کانال {CHANNEL_ID} ارسال شد.")
    except Exception as e:
        logger.error(f"❌ خطا در اجرای زمانبندی {schedule_desc}: {e}")

def setup_advanced_scheduler() -> AsyncIOScheduler:
    """پیکربندی جاب‌های زمانبندی با در نظر گرفتن منطقه زمانی مشخص"""
    scheduler = AsyncIOScheduler()

    for item in SCHEDULE_CONFIGS:
        tz = item.get("timezone", "Asia/Tehran")
        cat = item.get("category", "all")
        desc = item.get("description", "زمانبندی فال")
        
        # ۱. زمانبندی روزانه (Daily)
        if item["type"] == "daily":
            for time_str in item["hours"]:
                hour, minute = map(int, time_str.split(":"))
                trigger = CronTrigger(hour=hour, minute=minute, timezone=tz)
                scheduler.add_job(
                    execute_scheduled_post,
                    trigger=trigger,
                    args=[cat, f"{desc} ({time_str} - {tz})"],
                    id=f"{item['id']}_{time_str.replace(':', '')}"
                )
                logger.info(f"⏰ زمانبندی روزانه تنظیم شد: ساعت {time_str} در منطقه {tz}")

        # ۲. زمانبندی هفتگی (Weekly)
        elif item["type"] == "weekly":
            day_str = ",".join(item.get("days_of_week", ["fri"]))
            for time_str in item["hours"]:
                hour, minute = map(int, time_str.split(":"))
                trigger = CronTrigger(day_of_week=day_str, hour=hour, minute=minute, timezone=tz)
                scheduler.add_job(
                    execute_scheduled_post,
                    trigger=trigger,
                    args=[cat, f"{desc} (روزهای {day_str} ساعت {time_str})"],
                    id=f"{item['id']}_{day_str}_{time_str.replace(':', '')}"
                )
                logger.info(f"📅 زمانبندی هفتگی تنظیم شد: روزهای {day_str} ساعت {time_str} ({tz})")

        # ۳. زمانبندی ماهانه (Monthly)
        elif item["type"] == "monthly":
            day_str = ",".join(map(str, item.get("days_of_month", [1])))
            for time_str in item["hours"]:
                hour, minute = map(int, time_str.split(":"))
                trigger = CronTrigger(day=day_str, hour=hour, minute=minute, timezone=tz)
                scheduler.add_job(
                    execute_scheduled_post,
                    trigger=trigger,
                    args=[cat, f"{desc} (روزهای {day_str} ماه ساعت {time_str})"],
                    id=f"{item['id']}_day{day_str}"
                )
                logger.info(f"🗓 زمانبندی ماهانه تنظیم شد: روزهای {day_str} ماه ساعت {time_str} ({tz})")

        # ۴. ارسال در تاریخ مشخص آینده (Once / Specific Date)
        elif item["type"] == "once":
            run_date = item.get("run_date")
            if run_date:
                trigger = DateTrigger(run_date=run_date, timezone=tz)
                scheduler.add_job(
                    execute_scheduled_post,
                    trigger=trigger,
                    args=[cat, f"{desc} (تاریخ {run_date})"],
                    id=item['id']
                )
                logger.info(f"📌 زمانبندی تاریخ آینده تنظیم شد: {run_date} ({tz})")

    return scheduler
`;

  const telegramReceiverPy = `# -*- coding: utf-8 -*-
"""
ماژول دریافت و شنود پیام‌ها با استفاده از Pyrogram به صورت ناهمگام
"""
import logging
from pyrogram import Client, filters
from pyrogram.types import Message
from config import BOT_TOKEN, API_ID, API_HASH, CHANNEL_ID
from fal_engine import generate_fal_post
from bot_sender import TelegramBotSender

logger = logging.getLogger("PyrogramReceiver")
sender = TelegramBotSender()

receiver_app = Client(
    "admin_receiver_session",
    api_id=API_ID,
    api_hash=API_HASH,
    bot_token=BOT_TOKEN
)

@receiver_app.on_message(filters.command(["start", "help"]))
async def handle_start_command(client: Client, message: Message):
    welcome_text = (
        "👋 <b>سلام ادمین گرامی!</b>\\n\\n"
        "سامانه هوشمند زمانبندی فال و محتوای تلگرام فعال است.\\n"
        f"کانال هدف: <code>{CHANNEL_ID}</code>\\n\\n"
        "قابلیت‌های فعال:\\n"
        "• زمانبندی روزانه (Daily)\\n"
        "• زمانبندی هفتگی (Weekly)\\n"
        "• زمانبندی ماهانه (Monthly)\\n"
        "• زمانبندی تاریخ مشخص آینده (Specific Future Date)\\n"
        "• پشتیبانی کامل از TimeZone\\n\\n"
        "دستورات:\\n"
        "• /send_now - ارسال فوری یک فال به کانال\\n"
        "• /status - مشاهده وضعیت زمانبندی‌ها"
    )
    await message.reply_text(welcome_text, parse_mode="HTML")

@receiver_app.on_message(filters.command("send_now"))
async def handle_send_now(client: Client, message: Message):
    await message.reply_text("⏳ در حال تولید و ارسال فال به کانال...")
    try:
        content = generate_fal_post()
        await sender.send_message(content)
        await message.reply_text("✅ با موفقیت در کانال منتشر شد!")
    except Exception as e:
        await message.reply_text(f"❌ خطا در ارسال: {e}")
`;

  const falEnginePy = `# -*- coding: utf-8 -*-
"""
ماژول تولید فال روزانه، فال حافظ، انرژی مثبت و انگیزشی
"""
import random
from typing import Optional
from config import CHANNEL_SIGNATURE

FAL_COLLECTION = [
    {
        "category": "hafez",
        "title": "فال حافظ: مژده وصال و شادمانی",
        "poem": (
            "یوسف گمگشته بازآید به کنعان غم مخور\\n"
            "کلبه احزان شود روزی گلستان غم مخور\\n"
            "ای دل غمدیده حالت به شود دل بد مکن\\n"
            "وین سر شوریده بازآید به سامان غم مخور"
        ),
        "interpretation": "غم و انتظار شما به زودی به سر خواهد آمد. خبری خوشایند و گشایشی غیرمنتظره در راه است.",
        "advice": "شکیبایی پیشه کنید و امید قلبی‌تان را حفظ نمایید.",
        "omen": "فرخنده و پربرکت 🌟"
    },
    {
        "category": "energy",
        "title": "فال انرژی مثبت کیهانی",
        "poem": None,
        "interpretation": "امروز فرکانس کائنات در بالاترین هماهنگی با ارتعاش اهداف شما قرار دارد.",
        "advice": "شکرگزار نعمت‌ها باشید و با احساس فراوانی روز را سپری کنید.",
        "omen": "درخشان و ثروت‌آفرین 💎"
    },
    {
        "category": "motivation",
        "title": "فال انگیزشی: پیروزی و اراده",
        "poem": None,
        "interpretation": "موانع در برابر اراده مصمم شما رنگ می‌بازند. استمرار کلید فتح است.",
        "advice": "از سرزنش گذشته دست بردارید و روی هدف کنونی متمرکز شوید.",
        "omen": "پیروزی قاطع 🏆"
    }
]

def generate_fal_post(category: Optional[str] = "all") -> str:
    """تولید متن فرمت شده فال مناسب ارسال در کانال تلگرام"""
    items = FAL_COLLECTION
    if category and category != "all":
        filtered = [f for f in FAL_COLLECTION if f.get("category") == category]
        if filtered:
            items = filtered

    item = random.choice(items)
    post = f"✨ <b>{item['title']}</b> ✨\\n\\n"
    if item.get("poem"):
        post += f"📜 <i>«غزل ناب»</i>\\n<i>{item['poem']}</i>\\n\\n"
    
    post += f"🔮 <b>تعبیر و طالع:</b>\\n{item['interpretation']}\\n\\n"
    post += f"💡 <b>پند روز:</b>\\n{item['advice']}\\n\\n"
    post += f"🌟 <b>طالع نهایی:</b> {item['omen']}\\n"
    post += "\\n━━━━━━━━━━━━━━━━━━━━\\n"
    post += f"📢 <b>کانال:</b> {CHANNEL_SIGNATURE}"
    return post
`;

  const mainPy = `# -*- coding: utf-8 -*-
"""
فایل اصلی و ماژولار اجرایی (Asynchronous Main Runner)
اجرای همزمان شنود Pyrogram و زمانبند پیشرفته APScheduler با TimeZone
"""
import asyncio
import logging
from config import BOT_TOKEN, CHANNEL_ID, DEFAULT_TIMEZONE
from bot_sender import TelegramBotSender
from telegram_receiver import receiver_app
from scheduler_service import setup_advanced_scheduler

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger("AutoAdminBot")

sender = TelegramBotSender(BOT_TOKEN)

async def main():
    logger.info("🚀 در حال راه‌اندازی ادمین هوشمند تلگرام...")
    logger.info(f"🌐 منطقه زمانی: {DEFAULT_TIMEZONE} | کانال: {CHANNEL_ID}")
    
    # تست اتصال ربات
    try:
        bot_info = await sender.get_me()
        logger.info(f"🤖 ربات با موفقیت متصل شد: @{bot_info.get('username')}")
    except Exception as e:
        logger.critical(f"خطا در اعتبارسنجی ربات تلگرام: {e}")
        return

    # راه‌اندازی زمانبند پیشرفته (APScheduler)
    scheduler = setup_advanced_scheduler()
    scheduler.start()
    logger.info("⏰ موتور زمانبندی پیشرفته (روزانه، هفتگی، ماهانه، تاریخ مشخص) فعال شد.")

    # اجرای همزمان دریافت پیام (Pyrogram)
    logger.info("📡 سرویس Pyrogram برای شنود و دریافت رویدادها آغاز به کار کرد.")
    await receiver_app.start()

    # معلق ماندن تا دریافت سیگنال توقف
    try:
        await asyncio.Event().wait()
    finally:
        scheduler.shutdown()
        await receiver_app.stop()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logger.info("سیستم با موفقیت خاموش شد.")
`;

  const requirementsTxt = `pyrogram>=2.0.106
tgcrypto>=1.2.5
aiohttp>=3.9.3
apscheduler>=3.10.4
pytz>=2024.1
python-dotenv>=1.0.1
`;

  const readmeMd = `# ادمین هوشمند تلگرام (Advanced Asynchronous Telegram Admin)

سامانه خودکار ارسال زمانبندی شده فال و محتوا با ویژگی‌های پیشرفته:
- **زمانبندی روزانه (Daily):** ارسال در چندین نوبت در شبانه‌روز
- **زمانبندی هفتگی (Weekly):** تعیین روزهای خاص هفته (مثلاً جمعه‌ها)
- **زمانبندی ماهانه (Monthly):** ارسال در روزهای خاص ماه (اول، پانزدهم و...)
- **تاریخ مشخص آینده (Specific Date):** ارسال در تاریخ و ساعت معین در آینده
- **پشتیبانی از چندین منطقه زمانی (Multi Time Zone):** تهران، دبی، لندن، ساعت جهانی و...
- **دریافت و شنود:** Pyrogram Async
- **ارسال محتوا:** Telegram Bot API با \`aiohttp\`

## نحوه راه‌اندازی:
\`\`\`bash
pip install -r requirements.txt
python main.py
\`\`\`
`;

  return {
    'main.py': mainPy,
    'config.py': configPy,
    'scheduler_service.py': schedulerServicePy,
    'bot_sender.py': botSenderPy,
    'telegram_receiver.py': telegramReceiverPy,
    'fal_engine.py': falEnginePy,
    'requirements.txt': requirementsTxt,
    'README.md': readmeMd
  };
}
