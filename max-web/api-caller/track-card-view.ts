const API = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8788';

type TrackCardViewResponse =
  | { ok: true; view_count: number }
  | { ok: false; error: string };

type TrackCardViewPayload = {
  card_id: string;
  user_id: number;
};

/**
 * Отправляет информацию о просмотре карточки на сервер.
 * 
 * Сохраняет или обновляет информацию о просмотре карточки пользователем в БД.
 * Если просмотр уже был сохранён ранее, обновляет время последнего просмотра и увеличивает счётчик.
 * 
 * @param payload - данные просмотра:
 *   - card_id: ID карточки, которую просмотрел пользователь
 *   - user_id: ID пользователя MAX
 * 
 * @returns Количество просмотров карточки после обновления
 * 
 * Успех: возвращает количество просмотров.
 * Ошибка HTTP или ответа `ok: false` — выбрасывает исключение с текстом ошибки.
 */
export async function trackCardViewFromUI(payload: TrackCardViewPayload): Promise<number> {
  const response = await fetch(`${API}/track-card-view`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const result = (await response.json()) as TrackCardViewResponse;
  if (!result.ok) {
    throw new Error(result.error || 'Failed to track card view');
  }

  return result.view_count;
}

