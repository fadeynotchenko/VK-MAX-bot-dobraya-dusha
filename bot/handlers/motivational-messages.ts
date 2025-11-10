import { Bot } from '@maxhub/max-bot-api';
import { getUserTotalViewCount } from '../../db/db-card-views-utils.ts';
import dotenv from 'dotenv';

dotenv.config();

// Пороги для отправки мотивационных сообщений
const MOTIVATION_THRESHOLDS = [3, 5, 10, 20];

/**
 * Генерирует мотивационное сообщение на основе общего количества просмотров.
 */
function getMotivationalMessage(totalViewCount: number): string {
  if (totalViewCount === 3) {
    return '🎉 Отлично! Вы уже просмотрели 3 инициативы. Продолжайте исследовать возможности помочь!';
  } else if (totalViewCount === 5) {
    return '🌟 Превосходно! 5 просмотренных инициатив — вы на правильном пути к добрым делам!';
  } else if (totalViewCount === 10) {
    return '💫 Невероятно! 10 инициатив — вы настоящий активист добра! Спасибо за вашу активность!';
  } else if (totalViewCount === 20) {
    return '🏆 Потрясающе! 20 инициатив — вы вдохновляете других на добрые дела! Продолжайте в том же духе!';
  }
  return `👍 Спасибо за интерес к инициативам! Вы уже просмотрели ${totalViewCount} карточек.`;
}

/**
 * Отправляет сообщение пользователю через HTTP API MAX.
 */
async function sendMessageToUser(userId: number, message: string): Promise<void> {
  const maxApiUrl = process.env.MAX_API_URL || 'https://api.max.ru';
  const botToken = process.env.BOT_TOKEN;
  
  if (!botToken) {
    throw new Error('BOT_TOKEN is not set');
  }

  const response = await fetch(`${maxApiUrl}/bot/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${botToken}`,
    },
    body: JSON.stringify({
      user_id: userId,
      text: message,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`MAX API error: ${response.status} ${errorText}`);
  }
}

/**
 * Проверяет, нужно ли отправить мотивационное сообщение пользователю.
 * 
 * @param bot - экземпляр бота (не используется напрямую, но нужен для совместимости)
 * @param userId - ID пользователя MAX
 * 
 * Получает общее количество просмотров пользователя и отправляет мотивационное сообщение,
 * если достигнут один из порогов.
 */
export async function checkAndSendMotivationalMessage(bot: Bot, userId: number): Promise<void> {
  try {
    const totalViewCount = await getUserTotalViewCount(userId);

    // Отправляем мотивационное сообщение при достижении порогов
    if (MOTIVATION_THRESHOLDS.includes(totalViewCount)) {
      const message = getMotivationalMessage(totalViewCount);
      
      // Отправляем сообщение через HTTP API MAX
      await sendMessageToUser(userId, message);

      console.log(`✅ Motivational message sent to user ${userId} (total views: ${totalViewCount})`);
    }
  } catch (error) {
    console.error(`Failed to check/send motivational message for user ${userId}:`, error);
    // Не пробрасываем ошибку, чтобы не нарушить основной поток
  }
}

