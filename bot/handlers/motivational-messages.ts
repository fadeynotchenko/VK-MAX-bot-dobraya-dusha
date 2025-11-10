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
 * Отправляет сообщение пользователю через MAX API.
 * Использует POST /messages согласно документации MAX API.
 * URL: https://platform-api.max.ru/messages
 */
async function sendMessageToUser(bot: Bot, userId: number, message: string): Promise<void> {
  const botToken = process.env.BOT_TOKEN;
  
  if (!botToken) {
    throw new Error('BOT_TOKEN is not set in environment variables');
  }

  const apiUrl = 'https://platform-api.max.ru/messages';
  console.log(`📤 Sending message to user ${userId} via MAX API: ${apiUrl}`);

  const response = await fetch(apiUrl, {
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
    const errorDetails = `Status: ${response.status}, Response: ${errorText}`;
    console.error(`❌ MAX API error details: ${errorDetails}`);
    throw new Error(`MAX API error: ${errorDetails}`);
  }

  const responseData = await response.json().catch(() => ({}));
  console.log(`✅ Message sent successfully to user ${userId}. API response:`, JSON.stringify(responseData));
}

/**
 * Проверяет, нужно ли отправить мотивационное сообщение пользователю при закрытии мини-приложения.
 * 
 * @param bot - экземпляр бота для отправки сообщений
 * @param userId - ID пользователя MAX
 * 
 * Получает общее количество просмотров пользователя и отправляет мотивационное сообщение,
 * если достигнут один из порогов.
 */
export async function checkAndSendMotivationalMessage(bot: Bot, userId: number): Promise<void> {
  try {
    console.log(`🔍 Checking motivational message for user ${userId}...`);
    
    const totalViewCount = await getUserTotalViewCount(userId);
    console.log(`📊 User ${userId} total view count: ${totalViewCount}`);

    // Отправляем мотивационное сообщение при достижении порогов
    if (MOTIVATION_THRESHOLDS.includes(totalViewCount)) {
      const message = getMotivationalMessage(totalViewCount);
      console.log(`💬 Preparing to send motivational message to user ${userId}: "${message}"`);
      
      // Отправляем сообщение через метод бота
      await sendMessageToUser(bot, userId, message);

      console.log(`✅ Motivational message sent to user ${userId} (total views: ${totalViewCount})`);
    } else {
      console.log(`ℹ️ User ${userId} view count (${totalViewCount}) doesn't match any threshold. No message sent.`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ Failed to check/send motivational message for user ${userId}:`, errorMessage);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    // Не пробрасываем ошибку, чтобы не нарушить основной поток
  }
}

