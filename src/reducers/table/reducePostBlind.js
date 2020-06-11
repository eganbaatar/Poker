const {
  getTableById,
  getNextActiveSeat,
} = require('../../selectors/tableSelector');

const updateSeatAfterBet = (seat, amount) => {
  const bet = seat.chipsInPlay >= amount ? amount : seat.chipsInPlay;
  const chipsInPlay =
    seat.chipsInPlay >= amount ? seat.chipsInPlay - amount : 0;
  return {
    ...seat,
    bet,
    chipsInPlay,
    isAllIn: chipsInPlay === 0,
  };
};

const reducePostBlind = (state, { tableId, isSmallBlind = true }) => {
  const table = getTableById(state)(tableId);
  const actingSeat = table.seats[table.toAct];
  const betAmount = isSmallBlind ? table.smallBlind : table.bigBlind;
  const updatedSeat = updateSeatAfterBet(actingSeat, betAmount);
  Object.assign(actingSeat, updatedSeat);

  table.phase = isSmallBlind ? 'bigBlind' : 'preFlop';
  table.biggestBet = updatedSeat.bet;
  if (!isSmallBlind) table.lastPlayerToAct = table.toAct;
  table.toAct = getNextActiveSeat(table.seats, table.toAct).position;
};

module.exports = reducePostBlind;
