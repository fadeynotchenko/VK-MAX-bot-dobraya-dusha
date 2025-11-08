import type { FastifyReply, FastifyRequest } from 'fastify';
import { createMaxCard } from '../../db/db-card-utils.ts';
import type { MaxCardCreatePayload, MaxCardInput } from '../shared/max-card.ts';

type CreateMaxCardRequest = FastifyRequest<{
  Body: Partial<Record<keyof MaxCardCreatePayload, unknown>>;
}>;

const REQUIRED_FIELDS: Array<keyof MaxCardCreatePayload> = ['category', 'title', 'subtitle', 'text', 'status'];

function ensureString(value: unknown): value is string {
  return typeof value === 'string';
}

export async function handleCreateMaxCard(req: CreateMaxCardRequest, reply: FastifyReply) {
  try {
    const body = req.body ?? {};

    for (const field of REQUIRED_FIELDS) {
      const value = body[field];
      if (!ensureString(value) || value.trim().length === 0) {
        return reply.code(400).send({ ok: false, error: `Field "${field}" is required` });
      }
    }

    const payload: MaxCardInput = {
      category: (body.category as string).trim(),
      title: (body.title as string).trim(),
      subtitle: (body.subtitle as string).trim(),
      text: (body.text as string).trim(),
      status: (body.status as string).trim(),
      ...(ensureString(body.link) && body.link.trim().length > 0 ? { link: body.link.trim() } : {}),
    };

    const card = await createMaxCard(payload);
    return reply.code(201).send({ ok: true, data: card });
  } catch (e: any) {
    req.log.error(e);
    return reply.code(500).send({ ok: false, error: e?.message ?? 'Unknown error' });
  }
}
