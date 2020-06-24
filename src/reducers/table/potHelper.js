const { filter, orderBy, sumBy } = require('lodash');

const calculatePot = (table) => {
  const pot = table.pot || { current: 0 };
  const orderedSeatsWithBet = orderBy(
    filter(table.seats, (seat) => seat && seat.bet > 0),
    ['bet', 'chipsInPlay'],
    ['asc']
  );

  let sumBets = sumBy(orderedSeatsWithBet, 'bet');

  if (!orderedSeatsWithBet.find((seat) => seat.chipsInPlay === 0)) {
    pot.current = pot.current + sumBets;
    return pot;
  }

  let bets = orderedSeatsWithBet.map(({ bet }) => bet);
  let remainingPot = sumBets;
  // extract all in pots
  for (let i = 0; i < orderedSeatsWithBet.length; i++) {
    const seat = orderedSeatsWithBet[i];
    const seatBet = bets[i];
    if (seat.chipsInPlay > 0) {
      continue;
    }
    if (seatBet > 0) {
      pot[seat.position] = bets.reduce((acc, value) => {
        return acc + (value >= seatBet ? seatBet : value);
      }, 0);
      bets = bets.map((bet) => (bet > seatBet ? bet - seatBet : 0));
      remainingPot -= pot[seat.position];
    }
    // current pot should be added to side pot
    if (pot.current > 0) {
      pot[seat.position] += pot.current;
      pot.current = 0;
    }
  }
  pot.current = remainingPot;
  return pot;
};

const adjustOverBet = (table) => {};

exports.calculatePot = calculatePot;
