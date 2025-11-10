import dotenv from 'dotenv';

dotenv.config();

/**
 * Отправляет мотивационное сообщение пользователю через бота.
 * 
 * Использует HTTP API MAX для отправки сообщения.
 * 
 * @param userId - ID пользователя MAX
 * @param message - текст мотивационного сообщения
 * 
 * Успешное выполнение отправляет сообщение пользователю.
 * В случае ошибки пробрасывает исключение.
 */
export async function sendMotivationalMessage(userId: number, message: string): Promise<void> {
  try {
    // Используем HTTP API MAX для отправки сообщения
    // API endpoint для отправки сообщений через бота
    const apiUrl = process.env.MAX_API_URL || 'https://platform-api.max.ru';
    const botToken = process.env.BOT_TOKEN;
    
    if (!botToken) {
      throw new Error('BOT_TOKEN is not set');
    }

    const response = await fetch(`${apiUrl}/messages`, {
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
      throw new Error(`Failed to send message: ${response.status} ${errorText}`);
    }

    console.log(`✅ Motivational message sent to user ${userId}`);
  } catch (error) {
    console.error('Failed to send motivational message:', error);
    throw error;
  }
}

