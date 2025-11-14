/**
 * Утилиты для работы с MAX Bridge API
 * Документация: https://dev.max.ru/docs/webapps/bridge
 */

// Типы для MAX Bridge API
declare global {
  interface Window {
    WebApp?: {
      initDataUnsafe?: {
        user?: {
          id: number;
          first_name: string;
          last_name: string;
          username?: string;
          language_code?: string;
          photo_url?: string;
        };
        query_id?: string;
        auth_date?: number;
        hash?: string;
      };
      version?: string;
      platform?: string;
      ready: () => void;
      close: () => void;
      onEvent: (eventName: string, callback: (data: any) => void) => void;
      offEvent: (eventName: string, callback: (data: any) => void) => void;
    };
  }
}

export interface MaxUser {
  id: number;
  firstName: string;
  lastName: string;
  username?: string;
  languageCode?: string;
  photoUrl?: string;
}

/**
 * Получает данные пользователя из MAX Bridge
 * @returns Данные пользователя или null, если недоступны
 */
export function getMaxUser(): MaxUser | null {
  const webApp = window.WebApp;
  if (!webApp?.initDataUnsafe?.user) {
    return null;
  }

  const user = webApp.initDataUnsafe.user;
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    username: user.username,
    languageCode: user.language_code,
    photoUrl: user.photo_url,
  };
}

/**
 * Получает полное имя пользователя
 */
export function getUserFullName(user: MaxUser | null): string {
  if (!user) {
    return 'Пользователь';
  }
  return `${user.firstName} ${user.lastName}`.trim() || 'Пользователь';
}

/**
 * Получает инициалы пользователя для аватара
 */
export function getUserInitials(user: MaxUser | null): string {
  if (!user) {
    return '?';
  }
  const first = user.firstName?.[0]?.toUpperCase() || '';
  const last = user.lastName?.[0]?.toUpperCase() || '';
  return (first + last) || '?';
}

/**
 * Уведомляет MAX, что мини-приложение готово к работе
 */
export function notifyMaxReady(): void {
  if (window.WebApp?.ready) {
    window.WebApp.ready();
  }
}

/**
 * Проверяет, доступен ли MAX Bridge
 */
export function isMaxBridgeAvailable(): boolean {
  return typeof window.WebApp !== 'undefined';
}

/**
 * Подписывается на событие закрытия мини-приложения.
 * Использует несколько механизмов для надежного отслеживания закрытия:
 * 1. MAX Bridge событие viewportChanged с isStateVisible: false (основной способ)
 * 2. Событие pagehide браузера (надежнее beforeunload для мобильных)
 * 3. Событие visibilitychange браузера (fallback)
 * 4. Событие beforeunload браузера (fallback для десктопа)
 * 
 * @param callback - функция, которая будет вызвана при закрытии приложения
 * @returns функция для отписки от всех событий
 */
export function onAppClose(callback: () => void): () => void {
  let lastCallTime = 0;
  const CALL_THROTTLE_MS = 1000; // Минимальный интервал между вызовами (1 секунда)
  
  const callOnce = () => {
    const now = Date.now();
    // Разрешаем повторный вызов, если прошло достаточно времени (на случай если первый не успел)
    if (now - lastCallTime < CALL_THROTTLE_MS) {
      console.log(`⚠️ App close callback called too soon (${now - lastCallTime}ms ago), skipping duplicate call`);
      return;
    }
    lastCallTime = now;
    console.log('📱 Calling app close callback');
    try {
      // Вызываем синхронно, без задержек
      callback();
    } catch (error) {
      console.error('❌ Error in app close callback:', error);
      // Сбрасываем время последнего вызова при ошибке, чтобы можно было повторить
      lastCallTime = 0;
    }
  };

  const cleanupFunctions: Array<() => void> = [];

  if (window.WebApp?.onEvent) {
    const handleViewportChanged = (data: any) => {
      console.log('🔔 viewportChanged event received:', data);
      if (data?.isStateVisible === false) {
        console.log('📱 App close event detected (viewportChanged with isStateVisible: false)');
        callOnce();
      }
    };

    try {
      window.WebApp.onEvent('viewportChanged', handleViewportChanged);
      console.log('✅ Subscribed to viewportChanged event');
      cleanupFunctions.push(() => {
        if (window.WebApp?.offEvent) {
          window.WebApp.offEvent('viewportChanged', handleViewportChanged);
          console.log('🔕 Unsubscribed from viewportChanged event');
        }
      });
    } catch (error) {
      console.error('❌ Failed to subscribe to viewportChanged event:', error);
    }
  } else {
    console.warn('⚠️ MAX Bridge onEvent is not available, using browser events only');
  }

  const handlePageHide = (event: PageTransitionEvent) => {
    if (!event.persisted) {
      console.log('📱 App close event detected (pagehide)');
      callOnce();
    } else {
      console.log('📱 Page hidden but persisted (likely cached), not treating as close');
    }
  };
  window.addEventListener('pagehide', handlePageHide);
  cleanupFunctions.push(() => {
    window.removeEventListener('pagehide', handlePageHide);
  });

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      console.log('📱 App close event detected (visibilitychange: hidden)');
      // Вызываем сразу, без setTimeout - браузер может прервать выполнение до завершения setTimeout
      callOnce();
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
  cleanupFunctions.push(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  });

  const handleBeforeUnload = () => {
    console.log('📱 App close event detected (beforeunload)');
    callOnce();
  };
  window.addEventListener('beforeunload', handleBeforeUnload);
  cleanupFunctions.push(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  });

  return () => {
    console.log('🔕 Cleaning up app close handlers');
    cleanupFunctions.forEach(cleanup => cleanup());
  };
}

