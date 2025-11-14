import { type CSSProperties } from 'react';
import { colors, layout } from './theme';
import { triggerSoftHapticFeedback } from '../utils/maxBridge';

export type CategoryFilterOption = {
  label: string;
  value: string;
};

type CategoryFilterProps = {
  options: readonly CategoryFilterOption[];
  activeValue: CategoryFilterOption['value'];
  onChange: (value: CategoryFilterOption['value']) => void;
};

const containerStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
  padding: `0 ${layout.contentXPadding}`,
};

const buttonStyle: CSSProperties = {
  border: '1px solid transparent',
  background: colors.filterInactiveBackground,
  color: colors.filterInactiveText,
  borderRadius: 999,
  padding: '10px 18px',
  fontSize: 14,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: 0.6,
  cursor: 'pointer',
  transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
  whiteSpace: 'nowrap',
};

export function CategoryFilter({ options, activeValue, onChange }: CategoryFilterProps) {
  const handleFilterChange = (value: CategoryFilterOption['value']) => {
    if (value !== activeValue) {
      triggerSoftHapticFeedback();
    }
    onChange(value);
  };

  return (
    <div style={containerStyle}>
      {options.map((option) => {
        const isActive = option.value === activeValue;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleFilterChange(option.value)}
            style={{
              ...buttonStyle,
              background: isActive ? colors.filterActiveBackground : buttonStyle.background,
              borderColor: isActive ? colors.filterActiveBorder : 'transparent',
              color: isActive ? colors.filterActiveText : buttonStyle.color,
              boxShadow: isActive ? '0 8px 16px rgba(28, 49, 169, 0.35)' : 'none',
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
