const { drop } = require('lodash');
const {
  getTableById,
  getNextActiveSeatInHand,
} = require('../../selectors/tableSelector');
const { calculatePot } = require('./potHelper');
const { deal } = require('../../utils/deck');

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
  const { dealt, remaining } = deal(
    table.deck,
    table.phase === 'preFlop' ? 4 : 2
  );
  table.dealt = table.dealt.concat(dealt);
  table.board = table.board.concat(drop(dealt));
  table.deck = remaining;
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
