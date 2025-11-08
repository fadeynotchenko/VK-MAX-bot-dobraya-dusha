import type { MaxCard, MaxCardCreatePayload } from "../../api/shared/max-card.ts";

const API = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8788';

type CreateMaxCardResponse =
  | { ok: true; data: MaxCard }
  | { ok: false; error: string };

export type CreateMaxCardPayload = MaxCardCreatePayload;

export async function createMaxCardFromUI(payload: CreateMaxCardPayload): Promise<MaxCard> {
  const response = await fetch(`${API}/create-card`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const body = (await response.json()) as CreateMaxCardResponse;
  if (!body.ok) {
    throw new Error(body.error || 'Failed to create card');
  }

  return body.data;
}
