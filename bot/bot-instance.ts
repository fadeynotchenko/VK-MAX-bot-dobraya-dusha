import { Bot } from '@maxhub/max-bot-api';
import dotenv from 'dotenv';
import { botStartedHandler } from './handlers/bot-started.ts';
import { topCommandHandler } from './handlers/top-command.ts';

dotenv.config();

const bot = new Bot(process.env.BOT_TOKEN!);

// Обработчик события запуска бота
bot.on('bot_started', botStartedHandler);

// Обработчик команды /top
bot.command('top', topCommandHandler);

// Обработчик callback кнопки "Топ"
bot.callback('top_command', topCommandHandler);

// Регистрация списка команд
try {
  bot.api.setMyCommands([
    {
      command: 'top',
      description: 'Показать топ инициатив по просмотрам',
    },
  ]);
  console.log('✅ Список команд зарегистрирован');
} catch (error) {
  console.warn('⚠️ Не удалось зарегистрировать список команд:', error);
}

// Экспортируем бота для использования в других модулях (без запуска)
export { bot };

