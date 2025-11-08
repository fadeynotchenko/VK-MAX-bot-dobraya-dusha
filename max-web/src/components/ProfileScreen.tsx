import { type CSSProperties } from 'react';
import { Typography, Button } from '@maxhub/max-ui';
import { colors, layout } from './theme';

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
};

const nameStyle: CSSProperties = {
  margin: 0,
  fontSize: 24,
  lineHeight: 1.3,
  color: colors.textPrimary,
};

export function ProfileScreen({ onCreateInitiative }: ProfileScreenProps) {
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={avatarStyle}>A</div>
        <Typography.Title style={nameStyle}>Анна Иванова</Typography.Title>
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
