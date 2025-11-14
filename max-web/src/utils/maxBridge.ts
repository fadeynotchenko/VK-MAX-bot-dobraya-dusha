/**
 * Утилиты для работы с MAX Bridge API
 * Документация: https://dev.max.ru/docs/webapps/bridge
 */

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
 * Проверяет, является ли устройство мобильным
 */
function isMobileDevice(): boolean {
  const webApp = window.WebApp;
  if (webApp?.platform) {
    const platform = webApp.platform.toLowerCase();
    return platform === 'ios' || platform === 'android';
  }
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Подписывается на событие закрытия мини-приложения и синхронно отправляет уведомление на сервер
 */
export function onAppClose(userId: number, apiUrl: string): () => void {
  let isClosing = false;
  let appWasOpened = false;
  const isMobile = isMobileDevice();
  const cleanupFunctions: Array<() => void> = [];
  
  if (isMobile) {
    appWasOpened = true;
    console.log(`✅ App marked as opened immediately for mobile user ${userId}`);
  } else {
    const openDelay = 2000;
    const openTimeout = setTimeout(() => {
      appWasOpened = true;
      console.log(`✅ App marked as opened for desktop user ${userId}`);
    }, openDelay);
    
    cleanupFunctions.push(() => {
      clearTimeout(openTimeout);
    });
  }
  
  const sendNotification = () => {
    if (isClosing) {
      return;
    }
    
    if (!isMobile && !appWasOpened) {
      console.log(`⚠️ Skipping app close notification - app was not fully opened yet (user ${userId})`);
      return;
    }
    
    isClosing = true;
    
    const url = `${apiUrl}/on-app-close`;
    
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const sendBeacon = navigator.sendBeacon as ((url: string, data: FormData | Blob) => boolean) | undefined;
      
      if (sendBeacon) {
        try {
          const formData = new FormData();
          formData.append('user_id', userId.toString());
          
          if (sendBeacon(url, formData)) {
            console.log(`✅ App close notification sent via sendBeacon for user ${userId}`);
            return;
          }
        } catch (error) {
          console.error(`❌ sendBeacon error for user ${userId}:`, error);
        }

        try {
          const blob = new Blob([JSON.stringify({ user_id: userId })], { type: 'application/json' });
          if (sendBeacon(url, blob)) {
            console.log(`✅ App close notification sent via sendBeacon (Blob) for user ${userId}`);
            return;
          }
        } catch (error) {
          console.error(`❌ sendBeacon (Blob) error for user ${userId}:`, error);
        }
      }
    }

    try {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
        keepalive: true,
      }).catch(() => {});
    } catch (error) {
      console.error(`❌ Failed to notify app close for user ${userId}:`, error);
    }
  };

  if (window.WebApp?.onEvent) {
    const handleBackButton = () => {
      console.log('📱 App close event detected (backButtonClicked)');
      sendNotification();
    };

    try {
      window.WebApp.onEvent('backButtonClicked', handleBackButton);
      cleanupFunctions.push(() => {
        if (window.WebApp?.offEvent) {
          window.WebApp.offEvent('backButtonClicked', handleBackButton);
        }
      });
    } catch (error) {
      console.error('❌ Failed to subscribe to backButtonClicked event:', error);
    }

    const handleViewportChanged = (data: any) => {
      if (data?.isStateVisible === false || data?.isExpanded === false) {
        console.log('📱 App close event detected (viewportChanged)');
        sendNotification();
      }
    };

    try {
      window.WebApp.onEvent('viewportChanged', handleViewportChanged);
      cleanupFunctions.push(() => {
        if (window.WebApp?.offEvent) {
          window.WebApp.offEvent('viewportChanged', handleViewportChanged);
        }
      });
    } catch (error) {
      console.error('❌ Failed to subscribe to viewportChanged event:', error);
    }
  }

  const handleBlur = () => {
    console.log('📱 App close event detected (blur)');
    sendNotification();
  };
  window.addEventListener('blur', handleBlur, { capture: true });
  cleanupFunctions.push(() => {
    window.removeEventListener('blur', handleBlur, { capture: true });
  });

  const handlePageHide = (event: PageTransitionEvent) => {
    if (!event.persisted) {
      console.log('📱 App close event detected (pagehide)');
      sendNotification();
    }
  };
  window.addEventListener('pagehide', handlePageHide, { capture: true });
  cleanupFunctions.push(() => {
    window.removeEventListener('pagehide', handlePageHide, { capture: true });
  });

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      console.log('📱 App close event detected (visibilitychange)');
      sendNotification();
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange, { capture: true });
  cleanupFunctions.push(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange, { capture: true });
  });

  const handleUnload = () => {
    console.log('📱 App close event detected (unload)');
    sendNotification();
  };
  window.addEventListener('unload', handleUnload);
  cleanupFunctions.push(() => {
    window.removeEventListener('unload', handleUnload);
  });

  const handleBeforeUnload = () => {
    console.log('📱 App close event detected (beforeunload)');
    sendNotification();
  };
  window.addEventListener('beforeunload', handleBeforeUnload);
  cleanupFunctions.push(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  });

  return () => {
    cleanupFunctions.forEach(cleanup => cleanup());
  };
}

