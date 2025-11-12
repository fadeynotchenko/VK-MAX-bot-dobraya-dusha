import type { Bot } from '@maxhub/max-bot-api';
import { getUserTotalViewCount } from '../../db/db-card-views-utils.ts';
import { getLastViewCount, saveLastViewCount, getLastMotivationalMessageId, saveLastMotivationalMessageId } from '../../db/db-user-utils.ts';

const MOTIVATION_MESSAGES: readonly string[] = [
  'Продолжайте исследовать инициативы — каждая может стать вашим шансом помочь!',
  'Ваш интерес к добрым делам вдохновляет! Не останавливайтесь на достигнутом.',
  'Каждая просмотренная инициатива — это шаг к реальной помощи. Продолжайте в том же духе!',
  'Вы на правильном пути! Откликайтесь на инициативы, которые вам близки, и делайте мир лучше.',
];

function getRandomMotivation(): string {
  const randomIndex = Math.floor(Math.random() * MOTIVATION_MESSAGES.length);
  return MOTIVATION_MESSAGES[randomIndex] ?? MOTIVATION_MESSAGES[0]!;
}

function formatViewCount(count: number): string {
  if (count === 0) return '0';
  if (count === 1) return '1 инициативу';
  if (count >= 2 && count <= 4) return `${count} инициативы`;
  return `${count} инициатив`;
}

/**
 * Форматирует текущую дату на русском языке.
 * 
 * @returns Отформатированная дата в формате "15 января 2024"
 */
function formatCurrentDate(): string {
  const now = new Date();
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  
  const day = now.getDate();
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  
  return `${day} ${month} ${year}`;
}

/**
 * Генерирует мотивационное сообщение со статистикой просмотров.
 * 
 * @param viewsThisSession - количество просмотров за текущую сессию
 * @param totalViews - общее количество просмотров
 * @returns Сформированное сообщение
 */
function generateMotivationalMessage(viewsThisSession: number, totalViews: number): string {
  const viewsThisSessionText = formatViewCount(viewsThisSession);
  const totalViewsText = formatViewCount(totalViews);
  const motivation = getRandomMotivation();
  const currentDate = formatCurrentDate();
  
  if (viewsThisSession === 0) {
    return `📊 Статистика за ${currentDate}:\nЗа эту сессию: 0 просмотров\nВсего просмотрено: ${totalViewsText}\n\n${motivation}`;
  }
  
  return `📊 Статистика за ${currentDate}:\nЗа эту сессию: ${viewsThisSessionText}\nВсего просмотрено: ${totalViewsText}\n\n${motivation}`;
}

/**
 * Проверяет, является ли сообщение статистическим.
 * Проверяет наличие всех ключевых элементов статистического сообщения.
 * 
 * @param messageText - текст сообщения
 * @returns true, если сообщение содержит статистику
 */
function isStatisticsMessage(messageText: string | null): boolean {
  if (!messageText) return false;
  
  // Проверяем наличие всех ключевых элементов статистического сообщения
  const hasStatisticsEmoji = messageText.includes('📊 Статистика');
  const hasSessionInfo = messageText.includes('За эту сессию') || messageText.includes('сессию');
  const hasTotalInfo = messageText.includes('Всего просмотрено');
  
  // Сообщение статистическое только если содержит все элементы
  return hasStatisticsEmoji && hasSessionInfo && hasTotalInfo;
}

/**
 * Извлекает дату из текста статистического сообщения.
 * 
 * @param messageText - текст сообщения
 * @returns Дата в формате "15 января 2024" или null, если дата не найдена
 */
function extractDateFromMessage(messageText: string | null): string | null {
  if (!messageText) return null;
  
  const match = messageText.match(/📊 Статистика за (.+?):/);
  return match ? match[1]! : null;
}

/**
 * Проверяет и отправляет/редактирует мотивационное сообщение пользователю при закрытии мини-приложения.
 * 
 * Если у пользователя уже есть статистическое сообщение за сегодняшний день, редактирует его.
 * Если последнее сообщение не является статистическим, за другой день или его нет, отправляет новое.
 * 
 * Отправляет сообщение со статистикой: сколько просмотрено за эту сессию и всего.
 * Включает случайную мотивацию из 3-4 вариантов.
 * 
 * @param bot - экземпляр бота для отправки сообщений
 * @param userId - ID пользователя MAX
 */
export async function checkAndSendMotivationalMessage(bot: Bot, userId: number): Promise<void> {
  try {
    const [totalViewCount, lastViewCount, lastMessageId] = await Promise.all([
      getUserTotalViewCount(userId),
      getLastViewCount(userId),
      getLastMotivationalMessageId(userId),
    ]);

    const viewsThisSession = Math.max(0, totalViewCount - lastViewCount);
    const currentDate = formatCurrentDate();
    const message = generateMotivationalMessage(viewsThisSession, totalViewCount);
    
    // Пытаемся получить и проверить последнее сообщение
    if (lastMessageId) {
      try {
        const lastMessage = await bot.api.getMessage(lastMessageId);
        const lastMessageText = lastMessage.body?.text || null;
        
        // Проверяем, является ли сообщение статистическим
        if (isStatisticsMessage(lastMessageText)) {
          const lastMessageDate = extractDateFromMessage(lastMessageText);
          
          // Если дата совпадает с текущей И сообщение действительно статистическое, редактируем
          if (lastMessageDate && lastMessageDate === currentDate) {
            // Дополнительная проверка: убеждаемся, что можем редактировать сообщение
            try {
              await bot.api.editMessage(lastMessageId, { text: message });
              await saveLastViewCount(userId, totalViewCount);
              console.log(`✅ Статистика отредактирована для пользователя ${userId}`);
              return;
            } catch (editError: any) {
              // Если редактирование не удалось (сообщение удалено, недоступно и т.д.), отправляем новое
              console.log(`⚠️ Не удалось отредактировать сообщение ${lastMessageId}, отправляем новое`);
              const newMessage = await bot.api.sendMessageToUser(userId, message);
              await saveLastMotivationalMessageId(userId, newMessage.body.mid);
              await saveLastViewCount(userId, totalViewCount);
              console.log(`✅ Новая статистика отправлена пользователю ${userId}`);
              return;
            }
          }
        }
        
        // Если сообщение не статистическое или за другой день, отправляем новое
        const newMessage = await bot.api.sendMessageToUser(userId, message);
        await saveLastMotivationalMessageId(userId, newMessage.body.mid);
        await saveLastViewCount(userId, totalViewCount);
        console.log(`✅ Новая статистика отправлена пользователю ${userId}`);
      } catch (getError: any) {
        // Если сообщение не найдено, удалено или недоступно, отправляем новое
        const newMessage = await bot.api.sendMessageToUser(userId, message);
        await saveLastMotivationalMessageId(userId, newMessage.body.mid);
        await saveLastViewCount(userId, totalViewCount);
        console.log(`✅ Новая статистика отправлена пользователю ${userId}`);
      }
    } else {
      // Если ID сообщения нет, отправляем новое
      const newMessage = await bot.api.sendMessageToUser(userId, message);
      await saveLastMotivationalMessageId(userId, newMessage.body.mid);
      await saveLastViewCount(userId, totalViewCount);
      console.log(`✅ Новая статистика отправлена пользователю ${userId}`);
    }
  } catch (error: any) {
    console.error(`❌ Ошибка при отправке статистики пользователю ${userId}:`, error?.message || error);
    throw error;
  }
}

