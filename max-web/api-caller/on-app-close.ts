const API = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8788';

type OnAppCloseResponse =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Отправляет событие закрытия мини-приложения на сервер.
 * Использует navigator.sendBeacon для надежной отправки при закрытии приложения,
 * так как обычный fetch может быть прерван браузером.
 * 
 * @param userId - ID пользователя MAX, который закрыл мини-приложение
 * @param useBeacon - использовать ли sendBeacon (по умолчанию true для надежности)
 * 
 * Успех: возвращает { ok: true }.
 * Ошибка HTTP или ответа `ok: false` — выбрасывает исключение с текстом ошибки.
 */
export async function notifyAppClose(userId: number, useBeacon: boolean = true): Promise<void> {
  console.log(`📱 Notifying server about app close for user ${userId} (useBeacon: ${useBeacon})`);

  const payload = {
    user_id: userId,
  };

  // Пробуем sendBeacon с FormData (более надежно для серверов, которые ожидают multipart/form-data)
  if (useBeacon && typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
    try {
      const formData = new FormData();
      formData.append('user_id', userId.toString());
      
      const url = `${API}/on-app-close`;
      const sent = (navigator as any).sendBeacon(url, formData);
      
      if (sent) {
        console.log(`✅ App close notification sent via sendBeacon (FormData) for user ${userId}`);
        return;
      } else {
        console.warn(`⚠️ sendBeacon (FormData) failed for user ${userId}, trying Blob`);
      }
    } catch (error) {
      console.error(`❌ sendBeacon (FormData) error for user ${userId}:`, error);
    }

    // Fallback: пробуем sendBeacon с Blob (JSON)
    try {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      const url = `${API}/on-app-close`;
      const sent = (navigator as any).sendBeacon(url, blob);
      
      if (sent) {
        console.log(`✅ App close notification sent via sendBeacon (Blob/JSON) for user ${userId}`);
        return;
      } else {
        console.warn(`⚠️ sendBeacon (Blob) failed for user ${userId}, falling back to fetch`);
      }
    } catch (error) {
      console.error(`❌ sendBeacon (Blob) error for user ${userId}:`, error);
    }
  }

  // Последний fallback: fetch с keepalive
  try {
    const response = await fetch(`${API}/on-app-close`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true, // Критически важно для отправки при закрытии
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to notify app close: ${response.status} ${errorText}`);
    }

    const result = (await response.json()) as OnAppCloseResponse;
    if (!result.ok) {
      throw new Error(result.error || 'Failed to notify app close');
    }

    console.log(`✅ App close notification sent successfully via fetch for user ${userId}`);
  } catch (error) {
    console.error(`❌ Failed to notify app close for user ${userId}:`, error);
    // Не пробрасываем ошибку дальше, так как приложение уже закрывается
  }
}

