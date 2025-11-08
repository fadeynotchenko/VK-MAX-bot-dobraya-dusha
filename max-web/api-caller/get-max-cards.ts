import type { MaxCard } from "../../api/shared/max-card.ts";
export type { MaxCard } from "../../api/shared/max-card.ts";

const API = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8788';

type GetMaxCardsResponse =
  | { ok: true; data: MaxCard[] }
  | { ok: false; error: string };

/**
 * Загружает карточки через публичный API бота.
 *
 * Успех: возвращает массив DTO.
 * Ошибка HTTP или ответа `ok: false` — выбрасывает исключение с текстом ошибки.
 */
export async function fetchMaxCardsFromUI(): Promise<MaxCard[]> {
  const response = await fetch(`${API}/fetch-cards`);
  if (!response.ok) {
    throw new Error(await response.text());
  }

  const payload = (await response.json()) as GetMaxCardsResponse;
  if (!payload.ok) {
    throw new Error(payload.error || 'Failed to load cards');
  }

  return payload.data;
}
