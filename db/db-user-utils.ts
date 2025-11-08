import type { User } from '@maxhub/max-bot-api/types';
import { db } from './db-client.ts';

/**
 * Добавляет пользователя в MongoDB только один раз.
 * 
 * Если запись с таким `user_id` уже есть — счётчик не меняется.
 * Если записи нет — создаётся документ с именем и датой добавления.
 * 
 * @param user_id - идентификатор пользователя ВКонтакте
 * @param name - отображаемое имя пользователя
 */
export async function upsertUser(user_id: number, name: string) {
  await db.collection('max_users').updateOne(
    { user_id: user_id },
    {
      $setOnInsert: {
        name: name,
        addedAt: new Date()
      }
    },
    { upsert: true }
  );
}
