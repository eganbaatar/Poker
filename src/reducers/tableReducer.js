const { clone } = require('lodash');
const { createReducer } = require('@reduxjs/toolkit');
const { getTableById } = require('../selectors/tableSelector');
const { takeSeat, startGame } = require('../actions');

const reduceTakeSeat = (state, { playerId, tableId, seat, chips }) => {
  const table = getTableById(state)(tableId);
  const seats = clone(table.seats);
  seats[seat] = playerId;
  state.byId[tableId].seats = seats;
  state.byId[tableId].activeSeatsCount =
    state.byId[tableId].activeSeatsCount + 1;
  return state;
};

const tables = createReducer((state = {}), {
  [takeSeat]: (state, action) => reduceTakeSeat(state, action.payload),
});

module.exports = tables;
