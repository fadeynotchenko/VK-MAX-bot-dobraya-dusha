import { Context, Keyboard } from '@maxhub/max-bot-api';
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

  const siteUrl = process.env.WEB_APP_URL;
  const isLocalhost = siteUrl && (siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1') || siteUrl.includes('0.0.0.0'));
  
  if (!siteUrl) {
    console.warn('⚠️ Переменная окружения WEB_APP_URL не задана. Клавиатура со ссылкой не будет отправлена.');
  }

  const keyboardRows: Parameters<typeof Keyboard.inlineKeyboard>[0] = [];
  if (siteUrl && !isLocalhost) {
    keyboardRows.push([Keyboard.button.link('Открыть мини-приложение', siteUrl)]);
  }
  keyboardRows.push([Keyboard.button.link('Перейти на VK Добро', 'https://dobro.mail.ru/')]);

  const attachments = keyboardRows.length
    ? [Keyboard.inlineKeyboard(keyboardRows)]
    : undefined;

  const messageParts = [
    `Это бот помощи приграничным территориям. Привет, ${user.name}!`,
    'Здесь собраны инициативы поддержки, а ещё больше возможностей помогать найдёшь на ВК Добро.',
  ];

  if (siteUrl && isLocalhost) {
    messageParts.push(`\n🔗 Мини-приложение: ${siteUrl}`);
  }

  await ctx.reply(
    messageParts.join('\n\n'),
    attachments
      ? {
          attachments,
        }
      : undefined,
  );
  console.log('ℹ️ bot-started событие активировано для пользователя:', user.user_id);
}
