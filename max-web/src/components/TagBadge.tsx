import { type CSSProperties, type PropsWithChildren } from 'react';
import { colors } from './theme';

const baseStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: colors.textPrimary,
  borderRadius: 999,
  padding: '6px 12px',
  fontSize: 12,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: 0.6,
};

const CATEGORY_COLORS: Record<string, { background: string; text: string }> = {
  'благотворительность': {
    background: colors.tagCharityBackground,
    text: colors.tagCharityText,
  },
  'эко-мероприятие': {
    background: colors.tagEcoBackground,
    text: colors.tagEcoText,
  },
  'волонтерство': {
    background: colors.tagVolunteerBackground,
    text: colors.tagVolunteerText,
  },
};

function normalizeCategory(label?: string) {
  return label?.trim().toLowerCase();
}

type TagBadgeProps = PropsWithChildren<{
  category?: string;
  style?: CSSProperties;
}>;

export function TagBadge({ children, category, style }: TagBadgeProps) {
  const normalized = normalizeCategory(category);
  const palette = normalized ? CATEGORY_COLORS[normalized] : undefined;

  return (
    <span
      style={{
        ...baseStyle,
        backgroundColor: palette?.background ?? colors.tagBackground,
        color: palette?.text ?? colors.textPrimary,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
