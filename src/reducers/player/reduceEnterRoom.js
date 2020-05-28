const { getPlayerById } = require('../../selectors/playersSelector');

const reduceEnterRoom = (state, { playerId, tableId }) => {
  const player = getPlayerById(state)(playerId);
  if (!player) {
    return state;
  }
  state.byId[playerId] = {
    ...player,
    room: tableId,
  };
  return state;
};

module.exports = reduceEnterRoom;
