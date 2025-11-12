import { useState, type CSSProperties } from 'react';
import { Typography } from '@maxhub/max-ui';
import { colors, layout } from './theme';

const sectionStyle: CSSProperties = {
  margin: `12px ${layout.contentXPadding} 0`,
  padding: '16px 20px',
  borderRadius: layout.cornerRadius,
  background: 'linear-gradient(145deg, rgba(236, 129, 144, 0.2) 0%, rgba(236, 129, 144, 0.12) 100%)',
  border: `1px solid ${colors.filterVkDobroBorder}`,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  cursor: 'pointer',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
};

const sectionStyleHover: CSSProperties = {
  ...sectionStyle,
  transform: 'translateY(-2px)',
  boxShadow: '0 8px 24px rgba(236, 129, 144, 0.3)',
  background: 'linear-gradient(145deg, rgba(236, 129, 144, 0.25) 0%, rgba(236, 129, 144, 0.15) 100%)',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
};

const iconStyle: CSSProperties = {
  fontSize: 20,
  lineHeight: 1,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700,
  color: colors.textPrimary,
  flex: 1,
};

const descriptionStyle: CSSProperties = {
  margin: 0,
  fontSize: 13,
  lineHeight: 1.4,
  color: colors.textSecondary,
};

const linkStyle: CSSProperties = {
  marginTop: 2,
  fontSize: 14,
  fontWeight: 700,
  color: colors.filterVkDobroBackground,
  textDecoration: 'none',
};

export function VkDobroSection() {
  const handleClick = () => {
    window.open('https://dobro.vk.com/sos', '_blank', 'noopener,noreferrer');
  };

  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={isHovered ? sectionStyleHover : sectionStyle}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={headerStyle}>
        <span style={iconStyle}>❤</span>
        <Typography.Title style={titleStyle}>
          ВК Добро
        </Typography.Title>
      </div>
      <Typography.Body style={descriptionStyle}>
        Больше инициатив и возможностей помочь другим вы найдёте на платформе ВК Добро
      </Typography.Body>
      <Typography.Body style={linkStyle}>
        Открыть ВК Добро →
      </Typography.Body>
    </div>
  );
}

