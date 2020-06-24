type Card = 'Ad' | 'Ah' | 'Ac' | 'As';

interface Seat {
  position: number;
  playerId: string;
  chipsInPlay: number;
  inHand: boolean;
  isAllIn: boolean;
  cards: Card[];
  bet: number;
  sittingOut: boolean;
}

interface Table {
  id: number;
  gameOn: boolean;
  seatCount: number;
  activeSeatsCount: number;
  lastPlayerToAct: number;
  seats: Seat[];
  smallBlind: number;
  bigBlind: number;
  maxBuyIn: number;
  minByIn: number;
  button: number;
  toAct: number;
  board: Card[];
  deck: Card[];
  dealt: Card[];
}
