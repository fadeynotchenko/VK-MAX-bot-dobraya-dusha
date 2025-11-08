import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const user = process.env.DB_USER!;
const password = process.env.DB_PASSWORD!;
const host = process.env.DB_HOST!;
const auth_source = process.env.AUTH_SOURCE!;
const db_client = process.env.DB_CLIENT!;

const url = `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}/${db_client}?authSource=${auth_source}&directConnection=true`;

const client = new MongoClient(url, {
  tls: false,
  serverSelectionTimeoutMS: 5000,
});

/**
 * Подключается к MongoDB.
 * 
 * Если подключение успешно — выводит в консоль сообщение ✅.
 * Если произошла ошибка — выводит сообщение ❌ с ошибкой.
 * 
 */
export async function connectDB() {
  try {
    await client.connect();
    console.log('✅ Подключено к MongoDB');
  } catch (err) {
    console.error('❌ Ошибка подключения к MongoDB:', err);
    throw err;
  }
}

/**
 * Экземпляр базы данных MongoDB для выполнения операций (чтение/запись).
 * Используется после вызова connectDB().
 */
export const db = client.db(db_client);
