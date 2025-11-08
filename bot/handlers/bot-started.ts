import { Context } from "@maxhub/max-bot-api";
import { upsertUser } from '../../db/db-user-utils.ts';

/**
 * Обработчик события запуска бота.
 * 
 * Добавляет пользователя в базу данных, если его ещё нет,
 * и отправляет приветственное сообщение.
 * 
 * @param ctx - контекст события
 */
export async function botStartedHandler(ctx: Context) {
  const user = ctx.user;
  if (!user) return;

  await upsertUser(user.user_id, user.name);
  await ctx.reply(`Бот запущен и готов к работе. Привет, ${user.name}! 🚀`);
  console.log('ℹ️ bot-started событие активировано для пользователя:', user.user_id);
}
