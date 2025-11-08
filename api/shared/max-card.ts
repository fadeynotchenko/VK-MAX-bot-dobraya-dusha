export interface MaxCard {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  text: string;
  status: string;
  date: string;
  link?: string;
}

export type MaxCardInput = Omit<MaxCard, 'id' | 'date'>;
export type MaxCardCreatePayload = MaxCardInput;
