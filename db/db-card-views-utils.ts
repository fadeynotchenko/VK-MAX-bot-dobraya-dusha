import type { ObjectId } from 'mongodb';
import { db } from './db-client.ts';

type CardViewDocument = {
  _id?: ObjectId;
  card_id: string;
  user_id: number;
  viewed_at: Date;
  view_count: number;
};

/**
 * Сохраняет или обновляет информацию о просмотре карточки пользователем.
 * 
 * Если просмотр уже существует, обновляет время последнего просмотра и увеличивает счётчик.
 * Если просмотр не существует, создаёт новую запись со счётчиком = 1.
 * 
 * @param cardId - ID карточки, которую просмотрел пользователь
 * @param userId - ID пользователя MAX
 * @returns Количество просмотров карточки пользователем после обновления
 * 
 * Успешное выполнение сохраняет или обновляет запись о просмотре.
 * В случае ошибки пробрасывает исключение MongoDB.
 */
export async function trackCardView(cardId: string, userId: number): Promise<number> {
  // Сначала проверяем, существует ли документ
  const existing = await db.collection<CardViewDocument>('card_views').findOne({
    card_id: cardId,
    user_id: userId,
  });

  if (existing) {
    // Если документ существует, увеличиваем счётчик
    const result = await db.collection<CardViewDocument>('card_views').findOneAndUpdate(
      {
        card_id: cardId,
        user_id: userId,
      },
      {
        $set: {
          viewed_at: new Date(),
        },
        $inc: {
          view_count: 1,
        },
      },
      {
        returnDocument: 'after',
      }
    );
    return result?.view_count ?? existing.view_count + 1;
  } else {
    // Если документа нет, создаём новый со счётчиком = 1
    const result = await db.collection<CardViewDocument>('card_views').findOneAndUpdate(
      {
        card_id: cardId,
        user_id: userId,
      },
      {
        $set: {
          viewed_at: new Date(),
          view_count: 1,
        },
      },
      {
        upsert: true,
        returnDocument: 'after',
      }
    );
    return result?.view_count ?? 1;
  }
}

/**
 * Получает массив ID всех карточек, которые просмотрел пользователь.
 * 
 * @param userId - ID пользователя MAX
 * @returns Массив строковых ID просмотренных карточек
 * 
 * Успешное выполнение возвращает массив ID просмотренных карточек.
 * В случае ошибки пробрасывает исключение MongoDB.
 */
export async function getUserViewedCardIds(userId: number): Promise<string[]> {
  const views = await db.collection<CardViewDocument>('card_views')
    .find({ user_id: userId })
    .project({ card_id: 1 })
    .toArray();
  
  return views.map((view) => view.card_id);
}

/**
 * Получает количество просмотров конкретной карточки пользователем.
 * 
 * @param cardId - ID карточки
 * @param userId - ID пользователя MAX
 * @returns Количество просмотров или 0, если карточка не просматривалась
 * 
 * Успешное выполнение возвращает количество просмотров.
 * В случае ошибки пробрасывает исключение MongoDB.
 */
export async function getCardViewCount(cardId: string, userId: number): Promise<number> {
  const view = await db.collection<CardViewDocument>('card_views').findOne(
    {
      card_id: cardId,
      user_id: userId,
    },
    {
      projection: { view_count: 1 },
    }
  );
  
  return view?.view_count ?? 0;
}

