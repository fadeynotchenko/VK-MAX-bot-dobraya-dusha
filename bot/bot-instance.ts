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
bot.on('message_callback', async (ctx) => {
  try {
    const callbackData = 
      ('callbackData' in ctx && ctx.callbackData) 
        ? ctx.callbackData 
        : ('payload' in ctx && ctx.payload) 
          ? ctx.payload 
          : ('data' in ctx && ctx.data)
            ? ctx.data
            : undefined;
    
    if (callbackData === 'top_command') {
      console.log('🏆 Обработка callback кнопки "Топ"');
      
      if ('answerCallbackQuery' in ctx && typeof ctx.answerCallbackQuery === 'function') {
        await ctx.answerCallbackQuery();
      } else if ('answer' in ctx && typeof ctx.answer === 'function') {
        await ctx.answer();
      }
      
      await topCommandHandler(ctx);
    }
  } catch (error: any) {
    console.error('❌ Ошибка при обработке callback кнопки "Топ":', error?.message || error);
    
    try {
      if ('answerCallbackQuery' in ctx && typeof ctx.answerCallbackQuery === 'function') {
        await ctx.answerCallbackQuery();
      } else if ('answer' in ctx && typeof ctx.answer === 'function') {
        await ctx.answer();
      }
    } catch (answerError) {
    }
  }
});

// Экспортируем бота для использования в других модулях (без запуска)
export { bot };

// Регистрация списка команд (выполняется асинхронно при старте)
export async function registerBotCommands(): Promise<void> {
  try {
    if (bot.api.setMyCommands) {
      await bot.api.setMyCommands([
        {
          name: 'top',
          description: 'Показать топ инициатив по просмотрам',
        },
      ]);
      console.log('✅ Список команд зарегистрирован');
    }
  } catch (error) {
    console.warn('⚠️ Не удалось зарегистрировать список команд:', error);
  }
}

