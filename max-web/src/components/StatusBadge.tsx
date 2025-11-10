import { type CSSProperties } from 'react';

type StatusBadgeProps = {
  status: string;
  style?: CSSProperties;
};

const baseStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 999,
  padding: '4px 10px',
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  whiteSpace: 'nowrap',
};

const STATUS_CONFIG: Record<string, { label: string; background: string; text: string }> = {
  moderate: {
    label: 'На модерации',
    background: '#ffc107',
    text: '#1b1b22',
  },
  accepted: {
    label: 'Опубликовано',
    background: '#4caf50',
    text: '#ffffff',
  },
  rejected: {
    label: 'Отклонено',
    background: '#f44336',
    text: '#ffffff',
  },
};

export function StatusBadge({ status, style }: StatusBadgeProps) {
  const normalizedStatus = status?.toLowerCase().trim();
  const config = normalizedStatus ? STATUS_CONFIG[normalizedStatus] : null;

  if (!config) {
    return null;
  }

  return (
    <span
      style={{
        ...baseStyle,
        backgroundColor: config.background,
        color: config.text,
        ...style,
      }}
    >
      {config.label}
    </span>
  );
}

