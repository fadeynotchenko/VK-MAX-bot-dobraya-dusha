import { db } from './db-client.ts';

/**
 * Инкрементирует счётчик команды в аналитике.
 * Если команда вызывается впервые — создаёт запись.
 * 
 * @param command - команда (например, '/hello')
 */
export function incrementCommandUsage(command: string) {
  db.collection('max_analytics').updateOne(
    { command },
    {
      $inc: { count: 1 }
    },
    { upsert: true }
  );
}
