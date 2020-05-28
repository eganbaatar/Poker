const { createReducer } = require('@reduxjs/toolkit');
const { register, enterRoom, leaveRoom, takeSeat } = require('../../actions');
const { getPlayerById } = require('../../selectors/playersSelector');

const addPlayer = (state, { id, name, chips }) => {
  state.byId[id] = { id, name, chips, seat: -1 };
  return state;
};

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

const players = createReducer((state = {}), {
  [register]: (state, action) => addPlayer(state, action.payload),
  [enterRoom]: (state, action) => reduceEnterRoom(state, action.payload),
  [leaveRoom]: (state, action) => reduceLeaveRoom(state, action.payload),
  [takeSeat]: (state, action) => reduceTakeSeat(state, action.payload),
});

module.exports = players;
