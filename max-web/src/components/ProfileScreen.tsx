import { useEffect, useState, type CSSProperties } from 'react';
import { Typography, Button } from '@maxhub/max-ui';
import { colors, layout } from './theme';
import { getMaxUser, getUserFullName, getUserInitials, type MaxUser } from '../utils/maxBridge';

type ProfileScreenProps = {
  onCreateInitiative: () => void;
};

const containerStyle: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  padding: `0 ${layout.contentXPadding} 24px`,
  color: colors.textPrimary,
};

const headerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 16,
  padding: '32px 0 24px',
  borderRadius: 28,
  background: 'linear-gradient(160deg, rgba(17, 30, 55, 1) 0%, rgba(10, 19, 34, 1) 100%)',
};

const avatarStyle: CSSProperties = {
  width: 96,
  height: 96,
  borderRadius: '50%',
  backgroundColor: '#c0cadb',
  color: '#111d30',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 36,
  fontWeight: 700,
  overflow: 'hidden',
  position: 'relative',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
};

const avatarImageStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const avatarPlaceholderStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 36,
  fontWeight: 700,
};

const nameStyle: CSSProperties = {
  margin: 0,
  fontSize: 24,
  lineHeight: 1.3,
  color: colors.textPrimary,
};

const userIdStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.4,
  color: colors.textSecondary,
  fontWeight: 400,
};

export function ProfileScreen({ onCreateInitiative }: ProfileScreenProps) {
  const [user, setUser] = useState<MaxUser | null>(null);

  useEffect(() => {
    // Получаем данные пользователя при монтировании компонента
    // Используем небольшую задержку на случай, если WebApp еще не полностью инициализирован
    const loadUser = () => {
      const maxUser = getMaxUser();
      if (maxUser) {
        setUser(maxUser);
        return true;
      }
      return false;
    };

    // Пробуем загрузить сразу
    const loaded = loadUser();

    // Если данные не загрузились, пробуем еще раз через небольшую задержку
    if (!loaded) {
      const timeoutId = setTimeout(() => {
        loadUser();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, []);

  const fullName = getUserFullName(user);
  const initials = getUserInitials(user);
  const hasPhoto = user?.photoUrl;

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={avatarStyle}>
          {hasPhoto ? (
            <img src={user.photoUrl} alt={fullName} style={avatarImageStyle} />
          ) : (
            <div style={avatarPlaceholderStyle}>{initials}</div>
          )}
        </div>
        <Typography.Title style={nameStyle}>{fullName}</Typography.Title>
        {user && (
          <Typography.Body style={userIdStyle}>ID: {user.id}</Typography.Body>
        )}
      </div>

      <Button
        size="large"
        mode="primary"
        stretched
        onClick={onCreateInitiative}
        iconBefore={
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              lineHeight: 1,
              fontWeight: 600,
              width: 24,
            }}
          >
            +
          </span>
        }
      >
        Создать инициативу
      </Button>
    </div>
  );
}
