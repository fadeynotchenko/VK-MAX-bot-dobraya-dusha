import type { Context } from '@maxhub/max-bot-api';
import { getTopUsersByViews } from '../../db/db-user-utils.ts';

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
 * Обработчик команды /topviews.
 * 
 * Показывает топ пользователей по количеству просмотров карточек (min(N, 5)).
 * 
 * @param ctx - контекст команды
 */
export async function topViewsCommandHandler(ctx: Context): Promise<void> {
  try {
    const topUsers = await getTopUsersByViews(5);
    
    if (topUsers.length === 0) {
      await ctx.reply('📊 Пока нет пользователей с просмотрами.\n\nОткройте мини-приложение и начните просматривать инициативы!');
      return;
    }

    let message = `👁️ Топ ${topUsers.length} пользователей по просмотрам:\n\n`;
    
    topUsers.forEach((user, index) => {
      const position = index + 1;
      const viewsCount = formatViewCount(user.total_views);
      
      message += `${position}. 👤 ${user.name}\n`;
      message += `   👁️ ${viewsCount}\n`;
      message += '\n';
    });

    message += '💡 Откройте мини-приложение, чтобы просматривать инициативы!';

    await ctx.reply(message);
  } catch (error: any) {
    const userId = ctx.user?.user_id || 'неизвестного';
    console.error(`❌ Ошибка при выполнении команды /topviews для пользователя ${userId}:`, error?.message || error);
    await ctx.reply('❌ Произошла ошибка при получении топа пользователей. Попробуйте позже.');
  }
}

