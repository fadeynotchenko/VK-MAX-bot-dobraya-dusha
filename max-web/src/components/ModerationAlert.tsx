import { useEffect, type CSSProperties } from 'react';
import { Typography } from '@maxhub/max-ui';
import { colors, layout } from './theme';

type ModerationAlertProps = {
  visible: boolean;
  onClose: () => void;
  duration?: number;
};

const overlayStyle: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: layout.contentXPadding,
  animation: 'fadeIn 0.2s ease-out',
};

const alertStyle: CSSProperties = {
  backgroundColor: colors.detailSurface,
  borderRadius: layout.cornerRadius,
  padding: '24px',
  maxWidth: 400,
  width: '100%',
  boxShadow: '0 24px 48px rgba(5, 12, 28, 0.8)',
  border: `1px solid ${colors.cardBorder}`,
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
  animation: 'slideUp 0.3s ease-out',
};

const iconContainerStyle: CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: '50%',
  backgroundColor: 'rgba(43, 71, 255, 0.15)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  alignSelf: 'center',
};

const iconStyle: CSSProperties = {
  fontSize: 32,
  lineHeight: 1,
};

const buttonStyle: CSSProperties = {
  width: '100%',
  padding: '14px 24px',
  borderRadius: 18,
  border: 'none',
  backgroundColor: colors.filterActiveBackground,
  color: colors.filterActiveText,
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'opacity 0.2s ease',
};

const buttonHoverStyle: CSSProperties = {
  opacity: 0.9,
};

export function ModerationAlert({ visible, onClose, duration = 0 }: ModerationAlertProps) {
  useEffect(() => {
    if (!visible) return;

    // Автозакрытие через duration миллисекунд (если duration > 0)
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  if (!visible) return null;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={alertStyle} onClick={(e) => e.stopPropagation()}>
        <div style={iconContainerStyle}>
          <span style={iconStyle}>⏳</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'center' }}>
          <Typography.Title style={{ margin: 0, fontSize: 22, color: colors.textPrimary }}>
            Инициатива на модерации
          </Typography.Title>
          <Typography.Body style={{ color: colors.textSecondary, margin: 0, lineHeight: 1.5 }}>
            Ваша инициатива отправлена на модерацию. После одобрения она появится в списке.
          </Typography.Body>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={buttonStyle}
          onMouseEnter={(e) => {
            Object.assign(e.currentTarget.style, buttonHoverStyle);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          Понятно
        </button>
      </div>
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes slideUp {
            from {
              transform: translateY(20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
}

