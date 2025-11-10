import type { FastifyReply, FastifyRequest } from 'fastify';
import { checkAndSendMotivationalMessage } from '../../bot/handlers/motivational-messages.ts';
import { bot } from '../../bot/bot.ts';

type OnAppCloseBody = {
  user_id: number;
};

/**
 * Обрабатывает POST /on-app-close.
 * 
 * Принимает JSON body с полями:
 * - user_id (обязательное): ID пользователя MAX, который закрыл мини-приложение
 * 
 * Проверяет общее количество просмотров пользователя и отправляет мотивационное сообщение
 * при достижении определённых порогов (3, 5, 10, 20 просмотров всех карточек).
 *
 * Успех: отдаёт 200 с подтверждением { ok: true }.
 * Ошибка: логирует причину и возвращает 400/500 с текстом ошибки.
 */
export async function handleOnAppClose(req: FastifyRequest<{ Body: OnAppCloseBody }>, reply: FastifyReply) {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return reply.code(400).send({ ok: false, error: 'user_id is required' });
    }

    req.log.info(`📱 App closed event received for user ${user_id}`);

    // Проверяем общее количество просмотров и отправляем мотивационное сообщение при достижении порогов
    // Отправляем асинхронно, не блокируя ответ
    checkAndSendMotivationalMessage(bot, user_id).catch((err) => {
      req.log.error(`Failed to check/send motivational message for user ${user_id}:`, err);
    });

    return reply.code(200).send({ ok: true });
  } catch (e: any) {
    req.log.error(e);
    return reply.code(500).send({ ok: false, error: e?.message ?? 'Unknown error' });
  }
}

