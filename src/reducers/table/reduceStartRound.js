const { isNil } = require('lodash');
const {
  getTableById,
  getNextActiveSeat,
} = require('../../selectors/tableSelector');
const deck = require('../../utils/deck');

const reduceStartRound = (state, { tableId }) => {
  const defaultTableInfo = {
    gameOn: true,
    board: [],
    phase: 'smallBlind',
    deck: deck.shuffle(),
  };
  const defaultSeatInfo = {
    isAllIn: false,
    cards: [],
    bet: 0,
  };
  const table = getTableById(state)(tableId);
  Object.assign(table, defaultTableInfo);

  table.seats = table.seats.map((seat) => {
    if (isNil(seat)) {
      return;
    }
    const sitPlayerOut = seat.chipsInPlay <= 0 || seat.sittingOut === true;
    return {
      ...seat,
      ...defaultSeatInfo,
      sittingOut: sitPlayerOut,
      inHand: !sitPlayerOut,
    };
  });

  const activeSeats = table.seats.filter(
    (seat) => !isNil(seat) && seat.sittingOut != true
  );
  table.activeSeatsCount = activeSeats.length;

  // assign dealer button to random seat or to next player
  table.button = isNil(table.button)
    ? activeSeats[Math.floor(Math.random() * activeSeats.length)].position
    : getNextActiveSeat(table.seats, table.button).position;

  // if heads up game then dealer is small blind
  table.toAct =
    activeSeats.length === 2
      ? (table.toAct = table.button)
      : getNextActiveSeat(table.seats, table.button).position;
};

module.exports = reduceStartRound;
