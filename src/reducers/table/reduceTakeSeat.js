const { clone } = require('lodash');
const {
  getTableById,
  getDefaultSeatObject,
} = require('../../selectors/tableSelector');

const reduceTakeSeat = (state, { playerId, tableId, seat, chips }) => {
  const table = getTableById(state)(tableId);
  const seats = clone(table.seats);
  seats[seat] = {
    ...getDefaultSeatObject(playerId, seat, chips),
    playerId,
    chipsInPlay: chips,
    position: seat,
  };
  state.byId[tableId].seats = seats;
  state.byId[tableId].activeSeatsCount =
    state.byId[tableId].activeSeatsCount + 1;
  return state;
};

module.exports = reduceTakeSeat;
