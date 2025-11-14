import type { Context } from '@maxhub/max-bot-api';
import { getTopUsersByCards } from '../../db/db-user-utils.ts';

/**
 * Форматирует количество инициатив для отображения
 */
function formatCardsCount(count: number): string {
  if (count === 0) return '0';
  if (count === 1) return '1 инициатива';
  if (count >= 2 && count <= 4) return `${count} инициативы`;
  return `${count} инициатив`;
}

/**
 * Форматирует количество просмотров для отображения
 */
function formatViewCount(count: number): string {
  if (count === 0) return '0';
  if (count === 1) return '1 просмотр';
  if (count >= 2 && count <= 4) return `${count} просмотра`;
  return `${count} просмотров`;
}

/**
 * Обработчик команды /top.
 * 
 * Показывает топ пользователей по количеству созданных инициатив (топ 10, или меньше, если пользователей меньше).
 * 
 * @param ctx - контекст команды
 */
export async function topCommandHandler(ctx: Context): Promise<void> {
  try {
    const topUsers = await getTopUsersByCards(10);
    
    if (topUsers.length === 0) {
      await ctx.reply('📊 Пока нет пользователей с инициативами.\n\nОткройте мини-приложение и начните создавать инициативы!');
      return;
    }

    let message = `🏆 Топ ${topUsers.length} пользователей по количеству инициатив:\n\n`;
    
    topUsers.forEach((user, index) => {
      const position = index + 1;
      const cardsCount = formatCardsCount(user.cards_count);
      const viewsCount = formatViewCount(user.total_views);
      
      message += `${position}. 👤 ${user.name}\n`;
      message += `   📋 ${cardsCount}\n`;
      message += `   👁️ ${viewsCount}\n`;
      message += '\n';
    });

    message += '💡 Откройте мини-приложение, чтобы создать свою инициативу!';

    await ctx.reply(message);
  } catch (error: any) {
    console.error('❌ Ошибка при выполнении команды /top:', error?.message || error);
    await ctx.reply('❌ Произошла ошибка при получении топа пользователей. Попробуйте позже.');
  }
}

