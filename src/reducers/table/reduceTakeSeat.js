const { clone } = require('lodash');
const { getTableById } = require('../../selectors/tableSelector');

const reduceTakeSeat = (state, { playerId, tableId, seat }) => {
  const table = getTableById(state)(tableId);
  const seats = clone(table.seats);
  seats[seat] = playerId;
  state.byId[tableId].seats = seats;
  state.byId[tableId].activeSeatsCount =
    state.byId[tableId].activeSeatsCount + 1;
  return state;
};

module.exports = reduceTakeSeat;
