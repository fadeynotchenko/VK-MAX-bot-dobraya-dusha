import type { Context } from '@maxhub/max-bot-api';
import { getTopCardsByViews } from '../../db/db-card-utils.ts';

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
 * Получает эмодзи для категории
 */
function getCategoryEmoji(category: string): string {
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('благотворительность')) return '🫶';
  if (categoryLower.includes('эко')) return '🌱';
  if (categoryLower.includes('волонтерство')) return '🤝';
  return '📋';
}

/**
 * Обработчик команды /top.
 * 
 * Показывает топ карточек по количеству просмотров (топ 10, или меньше, если карточек меньше).
 * 
 * @param ctx - контекст команды
 */
export async function topCommandHandler(ctx: Context): Promise<void> {
  try {
    const topCards = await getTopCardsByViews(10);
    
    if (topCards.length === 0) {
      await ctx.reply('📊 Пока нет карточек с просмотрами.\n\nОткройте мини-приложение и начните изучать инициативы!');
      return;
    }

    let message = `🏆 Топ ${topCards.length} инициатив по просмотрам:\n\n`;
    
    topCards.forEach((card, index) => {
      const emoji = getCategoryEmoji(card.category);
      const views = formatViewCount(card.view_count ?? 0);
      const position = index + 1;
      
      message += `${position}. ${emoji} ${card.title}\n`;
      message += `   👁️ ${views}\n`;
      
      if (card.subtitle) {
        const subtitle = card.subtitle.length > 50 
          ? card.subtitle.substring(0, 50) + '...' 
          : card.subtitle;
        message += `   📝 ${subtitle}\n`;
      }
      
      message += '\n';
    });

    message += '💡 Откройте мини-приложение, чтобы увидеть все детали инициатив!';

    await ctx.reply(message);
  } catch (error: any) {
    console.error('❌ Ошибка при выполнении команды /top:', error?.message || error);
    await ctx.reply('❌ Произошла ошибка при получении топа инициатив. Попробуйте позже.');
  }
}

