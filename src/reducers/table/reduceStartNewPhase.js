const {
  getTableById,
  getNextActiveSeatInHand,
} = require('../../selectors/tableSelector');
const { calculatePot } = require('./potHelper');

const getNextPhase = (currentPhase) => {
  if (currentPhase === 'preFlop') {
    return 'flop';
  }

  if (currentPhase === 'flop') {
    return 'turn';
  }

  if (currentPhase === 'turn') {
    return 'river';
  }
};

const reduceStartNewPhase = (state, { tableId }) => {
  const table = getTableById(state)(tableId);
  table.pot = calculatePot(table);
  table.phase = getNextPhase(table.phase);
  table.biggestBet = 0;
  table.lastPlayerToAct = null;
  table.seats.forEach((seat) => {
    if (seat) {
      seat.bet = 0;
    }
  });
  table.toAct = getNextActiveSeatInHand(table.seats, table.button).position;
};

module.exports = reduceStartNewPhase;
