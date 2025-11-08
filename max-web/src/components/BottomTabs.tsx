import { type CSSProperties } from 'react';
import { colors, layout } from './theme';

export type BottomTabKey = 'home' | 'profile';

type BottomTabsProps = {
  active: BottomTabKey;
  onSelect: (tab: BottomTabKey) => void;
};

const containerStyle: CSSProperties = {
  position: 'fixed',
  left: '50%',
  bottom: 16,
  transform: 'translateX(-50%)',
  width: `calc(100% - 2 * ${layout.contentXPadding})`,
  maxWidth: 480,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
  padding: '12px 28px',
  backgroundColor: colors.bottomNavBackground,
  border: `1px solid ${colors.bottomNavBorder}`,
  borderRadius: 24,
  boxShadow: '0 18px 36px rgba(4, 10, 24, 0.6)',
  zIndex: 10,
};

const buttonStyle: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 6,
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  padding: '8px 0',
  fontSize: 12,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: 0.6,
};

function HomeIcon({ active }: { active: boolean }) {
  const stroke = active ? colors.bottomNavIconActive : colors.bottomNavIconInactive;
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-5h-4v5H5a1 1 0 0 1-1-1z"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  const stroke = active ? colors.bottomNavIconActive : colors.bottomNavIconInactive;
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8.5" r="3.5" stroke={stroke} strokeWidth="1.8" />
      <path
        d="M5 19.2c0-2.7 3.2-4.9 7-4.9s7 2.2 7 4.9"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

const TABS: Array<{ key: BottomTabKey; label: string; Icon: (props: { active: boolean }) => JSX.Element }> = [
  { key: 'home', label: 'Главная', Icon: HomeIcon },
  { key: 'profile', label: 'Профиль', Icon: ProfileIcon },
];

export function BottomTabs({ active, onSelect }: BottomTabsProps) {
  return (
    <nav style={containerStyle}>
      {TABS.map(({ key, label, Icon }) => {
        const isActive = key === active;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            style={{
              ...buttonStyle,
              color: isActive ? colors.bottomNavIconActive : colors.bottomNavLabelInactive,
            }}
          >
            <Icon active={isActive} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
