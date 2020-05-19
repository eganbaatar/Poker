const { clone, isNil, orderBy } = require('lodash');
const { createReducer } = require('@reduxjs/toolkit');
const { getTableById } = require('../selectors/tableSelector');
const { takeSeat, startRound } = require('../actions');
const { shuffle } = require('../utils/deck');

const getNextActiveSeat = (seats, startingPosition) => {
  const orderedActiveSeats = orderBy(
    seats.filter((seat) => seat.sittingOut != true),
    ['position'],
    ['asc']
  );
  const next = orderedActiveSeats.find(
    (seat) => seat.position > startingPosition
  );
  return next ? next : seats[0];
};

const reduceTakeSeat = (state, { playerId, tableId, seat }) => {
  const table = getTableById(state)(tableId);
  const seats = clone(table.seats);
  seats[seat] = playerId;
  state.byId[tableId].seats = seats;
  state.byId[tableId].activeSeatsCount =
    state.byId[tableId].activeSeatsCount + 1;
  return state;
};

const reduceStartRound = (state, { tableId }) => {
  const defaultTableInfo = {
    gameOn: true,
    board: [],
    phase: 'smallBlind',
    deck: shuffle(),
  };
  const defaultSeatInfo = {
    isAllIn: false,
    cards: [],
    bet: 0,
  };
  const table = getTableById(state)(tableId);
  Object.assign(table, defaultTableInfo);

  table.seats = table.seats.map((seat) => {
    const sitPlayerOut = seat.chipsInPlay <= 0 || seat.sittingOut === true;
    return {
      ...seat,
      ...defaultSeatInfo,
      sittingOut: sitPlayerOut,
      inHand: !sitPlayerOut,
    };
  });

  const activeSeats = table.seats.filter((seat) => seat.sittingOut != true);
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

const tables = createReducer((state = {}), {
  [takeSeat]: (state, action) => reduceTakeSeat(state, action.payload),
  [startRound]: (state, action) => reduceStartRound(state, action.payload),
});

module.exports = tables;
