const { getPlayerById } = require('../../selectors/playersSelector');

const reduceLeaveRoom = (state, { playerId }) => {
  const player = getPlayerById(state)(playerId);
  if (!player) {
    return state;
  }
  state.byId[playerId] = {
    ...player,
    room: null,
  };
  return state;
};

module.exports = reduceLeaveRoom;
