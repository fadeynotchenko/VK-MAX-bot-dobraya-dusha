import { Bot } from '@maxhub/max-bot-api';
import dotenv from 'dotenv';
import { botStartedHandler } from './handlers/bot-started.ts';
import { connectDB } from '../db/db-client.ts';

dotenv.config();

const bot = new Bot(process.env.BOT_TOKEN!);

// Обработчик события запуска бота
bot.on('bot_started', botStartedHandler);

await connectDB();

// Запуск
bot.start();

console.log('✅ Бот успешно запущен');

// Экспортируем бота для использования в других модулях
export { bot };
