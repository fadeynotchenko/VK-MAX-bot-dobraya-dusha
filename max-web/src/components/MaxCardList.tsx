import { type CSSProperties } from 'react';
import type { MaxCard } from '../../api-caller/get-max-cards.ts';
import { layout } from './theme';
import { MaxCardView } from './MaxCardView';

type MaxCardListProps = {
  cards: MaxCard[];
  onSelect: (card: MaxCard) => void;
  viewedCardIds: Set<string>;
};

const listStyle: CSSProperties = {
  width: '100%',
  padding: `0 ${layout.contentXPadding} 24px`,
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
};

export function MaxCardList({ cards, onSelect, viewedCardIds }: MaxCardListProps) {
  return (
    <div style={listStyle}>
      {cards.map((card) => (
        <MaxCardView 
          key={card.id} 
          card={card} 
          onOpen={onSelect}
          isViewed={viewedCardIds.has(card.id)}
        />
      ))}
    </div>
  );
}
