const API = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8788';

type OnAppCloseResponse =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Отправляет событие закрытия мини-приложения на сервер
 */
export async function notifyAppClose(userId: number, useBeacon: boolean = true): Promise<void> {
  console.log(`📱 Уведомление сервера о закрытии приложения для пользователя ${userId} (useBeacon: ${useBeacon})`);

  const payload = {
    user_id: userId,
  };

  const url = `${API}/on-app-close`;

  if (useBeacon && typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
    const sendBeacon = navigator.sendBeacon as ((url: string, data: FormData | Blob) => boolean) | undefined;
    
    if (sendBeacon) {
      try {
        const formData = new FormData();
        formData.append('user_id', userId.toString());
        
        const sent = sendBeacon(url, formData);
        
        if (sent) {
          console.log(`✅ Уведомление о закрытии приложения отправлено через sendBeacon (FormData) для пользователя ${userId}`);
          return;
        } else {
          console.warn(`⚠️ sendBeacon (FormData) вернул false для пользователя ${userId}, пробуем Blob`);
        }
      } catch (error) {
        console.error(`❌ Ошибка sendBeacon (FormData) для пользователя ${userId}:`, error);
      }

      try {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        const sent = sendBeacon(url, blob);
        
        if (sent) {
          console.log(`✅ Уведомление о закрытии приложения отправлено через sendBeacon (Blob/JSON) для пользователя ${userId}`);
          return;
        } else {
          console.warn(`⚠️ sendBeacon (Blob) вернул false для пользователя ${userId}, используем fetch`);
        }
      } catch (error) {
        console.error(`❌ Ошибка sendBeacon (Blob) для пользователя ${userId}:`, error);
      }
    }
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });

    console.log(`✅ Уведомление о закрытии приложения отправлено через fetch (keepalive) для пользователя ${userId}`);
    
    if (response.ok) {
      response.json().then((result: unknown) => {
        const typedResult = result as OnAppCloseResponse;
        if (!typedResult.ok) {
          console.error(`❌ Сервер вернул ошибку при закрытии приложения для пользователя ${userId}: ${typedResult.error}`);
        }
      }).catch(() => {
      });
    }
  } catch (error) {
    console.error(`❌ Не удалось отправить уведомление о закрытии приложения для пользователя ${userId}:`, error);
  }
}

