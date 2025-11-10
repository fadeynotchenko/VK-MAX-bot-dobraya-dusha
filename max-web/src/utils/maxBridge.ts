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
 * Вызывает callback при закрытии приложения (viewportChanged с isStateVisible: false).
 * 
 * @param callback - функция, которая будет вызвана при закрытии приложения
 * @returns функция для отписки от события
 */
export function onAppClose(callback: () => void): () => void {
  if (!window.WebApp?.onEvent) {
    console.warn('⚠️ MAX Bridge onEvent is not available');
    return () => {};
  }

  const handleViewportChanged = (data: any) => {
    // Событие viewportChanged с isStateVisible: false означает закрытие мини-приложения
    if (data?.isStateVisible === false) {
      console.log('📱 App close event detected (viewportChanged with isStateVisible: false)');
      callback();
    }
  };

  // Подписываемся на событие viewportChanged
  window.WebApp.onEvent('viewportChanged', handleViewportChanged);

  // Возвращаем функцию для отписки
  return () => {
    if (window.WebApp?.offEvent) {
      window.WebApp.offEvent('viewportChanged', handleViewportChanged);
    }
  };
}

