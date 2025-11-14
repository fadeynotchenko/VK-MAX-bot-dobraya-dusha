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
 * Использует VK Bridge событие VKWebAppViewHide согласно документации VK Bridge API.
 * Документация: https://dev.vk.com/mini-apps/development/bridge
 * 
 * @param callback - функция, которая будет вызвана при закрытии приложения
 * @returns функция для отписки от всех событий
 */
export function onAppClose(callback: () => void): () => void {
  let hasCalled = false;
  
  const callOnce = () => {
    if (hasCalled) {
      return;
    }
    hasCalled = true;
    console.log('📱 Calling app close callback');
    try {
      callback();
    } catch (error) {
      console.error('❌ Error in app close callback:', error);
      hasCalled = false; // Разрешаем повторный вызов при ошибке
    }
  };

  const cleanupFunctions: Array<() => void> = [];

  // Проверяем наличие VK Bridge (для мини-приложений ВКонтакте)
  if (typeof window !== 'undefined' && (window as any).vkBridge) {
    const vkBridge = (window as any).vkBridge;
    
    const handleVKEvent = (event: any) => {
      if (event.detail?.type === 'VKWebAppViewHide') {
        console.log('📱 VKWebAppViewHide event received');
        callOnce();
      }
    };

    try {
      vkBridge.subscribe(handleVKEvent);
      console.log('✅ Subscribed to VKWebAppViewHide event');
      cleanupFunctions.push(() => {
        if (vkBridge.unsubscribe) {
          vkBridge.unsubscribe(handleVKEvent);
          console.log('🔕 Unsubscribed from VKWebAppViewHide event');
        }
      });
    } catch (error) {
      console.error('❌ Failed to subscribe to VKWebAppViewHide event:', error);
    }
  }

  // Проверяем наличие MAX Bridge (для мини-приложений MAX)
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
      console.log('✅ Subscribed to viewportChanged event (MAX Bridge)');
      cleanupFunctions.push(() => {
        if (window.WebApp?.offEvent) {
          window.WebApp.offEvent('viewportChanged', handleViewportChanged);
          console.log('🔕 Unsubscribed from viewportChanged event');
        }
      });
    } catch (error) {
      console.error('❌ Failed to subscribe to viewportChanged event:', error);
    }
  }

  // Fallback: событие pagehide (надежнее для мобильных)
  const handlePageHide = (event: PageTransitionEvent) => {
    if (!event.persisted) {
      console.log('📱 App close event detected (pagehide)');
      callOnce();
    }
  };
  window.addEventListener('pagehide', handlePageHide);
  cleanupFunctions.push(() => {
    window.removeEventListener('pagehide', handlePageHide);
  });

  return () => {
    console.log('🔕 Cleaning up app close handlers');
    cleanupFunctions.forEach(cleanup => cleanup());
  };
}

