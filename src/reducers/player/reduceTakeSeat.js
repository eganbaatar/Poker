const { getPlayerById } = require('../../selectors/playersSelector');

const reduceTakeSeat = (state, { playerId, tableId, seat, chips }) => {
  const player = getPlayerById(state)(playerId);
  if (!player) {
    return state;
  }
  state.byId[playerId] = {
    ...player,
    chips: player.chips - chips,
    seat,
  };
};

module.exports = reduceTakeSeat;
