import type { FastifyReply, FastifyRequest } from 'fastify';
import { createMaxCard } from '../../db/db-card-utils.ts';
import type { MaxCardCreatePayload, MaxCardInput } from '../shared/max-card.ts';

const REQUIRED_FIELDS: Array<keyof MaxCardCreatePayload> = ['category', 'title', 'subtitle', 'text', 'status'];

function ensureString(value: unknown): value is string {
  return typeof value === 'string';
}

export async function handleCreateMaxCard(req: FastifyRequest, reply: FastifyReply) {
  try {
    const fields: Record<string, string> = {};
    
    let imageFile: { buffer: Buffer; filename: string; mimetype: string } | null = null;
    
    for await (const part of req.parts()) {
      if (part.type === 'file') {
        const buffer = await part.toBuffer();
        imageFile = {
          buffer,
          filename: part.filename || 'unknown',
          mimetype: part.mimetype || 'application/octet-stream',
        };
        
        req.log.info(
          {
            filename: imageFile.filename,
            mimetype: imageFile.mimetype,
            size: `${(imageFile.buffer.length / 1024).toFixed(2)} KB`,
          },
          '📸 Изображение получено'
        );
      } else {
        fields[part.fieldname] = part.value as string;
      }
    }

    // Валидация обязательных полей
    for (const field of REQUIRED_FIELDS) {
      const value = fields[field];
      if (!ensureString(value) || value.trim().length === 0) {
        return reply.code(400).send({ ok: false, error: `Field "${field}" is required` });
      }
    }

    // Конвертируем изображение в base64 и логируем
    let imageBase64: string | undefined;
    if (imageFile) {
      imageBase64 = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString('base64')}`;
      
      req.log.info(
        {
          filename: imageFile.filename,
          mimetype: imageFile.mimetype,
          sizeBytes: imageFile.buffer.length,
          sizeKB: (imageFile.buffer.length / 1024).toFixed(2),
          sizeMB: (imageFile.buffer.length / (1024 * 1024)).toFixed(2),
          base64Length: imageBase64.length,
        },
        '✅ Изображение успешно получено и конвертировано в base64'
      );
    } else {
      req.log.warn('⚠️ Изображение не было загружено');
    }

    // Извлекаем user_id, если он передан
    let userId: number | undefined;
    if (fields.user_id) {
      const parsedUserId = Number(fields.user_id);
      if (!isNaN(parsedUserId) && parsedUserId > 0) {
        userId = parsedUserId;
      }
    }

    const payload: MaxCardInput = {
      category: fields.category!.trim(),
      title: fields.title!.trim(),
      subtitle: fields.subtitle!.trim(),
      text: fields.text!.trim(),
      status: fields.status!.trim(),
      ...(ensureString(fields.link) && fields.link.trim().length > 0 ? { link: fields.link.trim() } : {}),
      ...(imageBase64 ? { image: imageBase64 } : {}),
      ...(userId ? { user_id: userId } : {}),
    };

    const card = await createMaxCard(payload);
    
    return reply.code(201).send({ ok: true, data: card });
  } catch (e: any) {
    req.log.error(e);
    return reply.code(500).send({ ok: false, error: e?.message ?? 'Unknown error' });
  }
}
