const API = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8788';

type GetViewedCardsResponse =
  | { ok: true; data: string[] }
  | { ok: false; error: string };

/**
 * Получает массив ID всех карточек, которые просмотрел пользователь.
 * 
 * @param userId - ID пользователя MAX
 * @returns Массив строковых ID просмотренных карточек
 * 
 * Успех: возвращает массив ID просмотренных карточек.
 * Ошибка HTTP или ответа `ok: false` — выбрасывает исключение с текстом ошибки.
 */
export async function fetchViewedCardsFromUI(userId: number): Promise<string[]> {
  const response = await fetch(`${API}/viewed-cards?user_id=${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const result = (await response.json()) as GetViewedCardsResponse;
  if (!result.ok) {
    throw new Error(result.error || 'Failed to fetch viewed cards');
  }

  return result.data;
}

