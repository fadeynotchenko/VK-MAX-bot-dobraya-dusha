import type { Bot } from '@maxhub/max-bot-api';
import { getUserTotalViewCount } from '../../db/db-card-views-utils.ts';

// Пороги для отправки мотивационных сообщений
const MOTIVATION_THRESHOLDS = [3, 5, 10, 20] as const;

/**
 * Генерирует мотивационное сообщение на основе общего количества просмотров.
 */
function getMotivationalMessage(totalViewCount: number): string {
  switch (totalViewCount) {
    case 3:
      return '🎉 Отлично! Вы уже просмотрели 3 инициативы. Продолжайте исследовать возможности помочь!';
    case 5:
      return '🌟 Превосходно! 5 просмотренных инициатив — вы на правильном пути к добрым делам!';
    case 10:
      return '💫 Невероятно! 10 инициатив — вы настоящий активист добра! Спасибо за вашу активность!';
    case 20:
      return '🏆 Потрясающе! 20 инициатив — вы вдохновляете других на добрые дела! Продолжайте в том же духе!';
    default:
      return `👍 Спасибо за интерес к инициативам! Вы уже просмотрели ${totalViewCount} карточек.`;
  }
}

/**
 * Проверяет, нужно ли отправить мотивационное сообщение пользователю при закрытии мини-приложения.
 * 
 * Использует метод библиотеки @maxhub/max-bot-api: bot.api.sendMessageToUser()
 * согласно документации: https://dev.max.ru/docs-api/methods/POST/messages
 * 
 * @param bot - экземпляр бота для отправки сообщений
 * @param userId - ID пользователя MAX
 * 
 * Получает общее количество просмотров пользователя и отправляет мотивационное сообщение,
 * если достигнут один из порогов (3, 5, 10, 20 просмотров всех карточек).
 */
export async function checkAndSendMotivationalMessage(bot: Bot, userId: number): Promise<void> {
  try {
    const totalViewCount = await getUserTotalViewCount(userId);

    if (!MOTIVATION_THRESHOLDS.includes(totalViewCount as typeof MOTIVATION_THRESHOLDS[number])) {
      return;
    }

    const message = getMotivationalMessage(totalViewCount);
    
    // Используем метод библиотеки согласно документации
    await bot.api.sendMessageToUser(userId, message);

    console.log(`✅ Motivational message sent to user ${userId} (total views: ${totalViewCount})`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ Failed to check/send motivational message for user ${userId}:`, errorMessage);
    // Не пробрасываем ошибку, чтобы не нарушить основной поток
  }
}

