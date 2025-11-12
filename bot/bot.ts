import { Bot } from '@maxhub/max-bot-api';
import dotenv from 'dotenv';
import { botStartedHandler } from './handlers/bot-started.ts';
import { connectDB } from '../db/db-client.ts';

dotenv.config();

const bot = new Bot(process.env.BOT_TOKEN!);

// Обработчик события запуска бота
bot.on('bot_started', botStartedHandler);

await connectDB();

// Функция для запуска бота с повторными попытками
async function startBotWithRetry(maxRetries = 5, initialDelay = 2000) {
  let delay = initialDelay;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Попытка запуска бота (${attempt}/${maxRetries})...`);
      await bot.start();
      console.log('✅ Бот успешно запущен');
      return;
    } catch (error: any) {
      const errorMessage = error?.cause?.message || error?.message || 'Неизвестная ошибка';
      const errorCode = error?.cause?.code || error?.code || 'UNKNOWN';
      
      console.error(`❌ Ошибка при запуске бота (попытка ${attempt}/${maxRetries}):`);
      console.error(`Код: ${errorCode}`);
      console.error(`Сообщение: ${errorMessage}`);
      
      if (attempt === maxRetries) {
        console.error('❌ Не удалось запустить бот после всех попыток');
        throw error;
      }
      
      console.log(`⏳ Повторная попытка через ${delay / 1000} секунд...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      delay = Math.min(delay * 1.5, 30000);
    }
  }
}

// Запуск бота с повторными попытками
await startBotWithRetry();

// Экспортируем бота для использования в других модулях
export { bot };
