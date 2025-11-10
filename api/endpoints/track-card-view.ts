import type { FastifyReply, FastifyRequest } from 'fastify';
import { trackCardView } from '../../db/db-card-views-utils.ts';
import { checkAndSendMotivationalMessage } from '../../bot/handlers/motivational-messages.ts';
import { bot } from '../../bot/bot.ts';

type TrackCardViewBody = {
  card_id: string;
  user_id: number;
};

/**
 * Обрабатывает POST /track-card-view.
 * 
 * Принимает JSON body с полями:
 * - card_id (обязательное): ID карточки, которую просмотрел пользователь
 * - user_id (обязательное): ID пользователя MAX
 * 
 * Сохраняет или обновляет информацию о просмотре карточки пользователем в БД.
 * Если просмотр уже был сохранён ранее, обновляет время последнего просмотра и увеличивает счётчик.
 * После сохранения проверяет общее количество просмотров и отправляет мотивационное сообщение
 * при достижении определённых порогов (3, 5, 10, 20 просмотров всех карточек).
 *
 * Успех: отдаёт 200 с подтверждением { ok: true, view_count: number }.
 * Ошибка: логирует причину и возвращает 400/500 с текстом ошибки.
 */
export async function handleTrackCardView(req: FastifyRequest<{ Body: TrackCardViewBody }>, reply: FastifyReply) {
  try {
    const { card_id, user_id } = req.body;

    if (!card_id || !user_id) {
      return reply.code(400).send({ ok: false, error: 'card_id and user_id are required' });
    }

    const viewCount = await trackCardView(card_id, user_id);

    // Проверяем общее количество просмотров и отправляем мотивационное сообщение при достижении порогов
    // Отправляем асинхронно, не блокируя ответ
    checkAndSendMotivationalMessage(bot, user_id).catch((err) => {
      req.log.error('Failed to check/send motivational message:', err);
    });

    return reply.code(200).send({ ok: true, view_count: viewCount });
  } catch (e: any) {
    req.log.error(e);
    return reply.code(500).send({ ok: false, error: e?.message ?? 'Unknown error' });
  }
}

