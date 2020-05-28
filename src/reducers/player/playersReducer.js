const { createReducer } = require('@reduxjs/toolkit');
const { register, enterRoom, leaveRoom, takeSeat } = require('../../actions');
const reducers = require('.');

const players = createReducer((state = {}), {
  [register]: (state, action) => reducers.reduceRegister(state, action.payload),
  [enterRoom]: (state, action) =>
    reducers.reduceEnterRoom(state, action.payload),
  [leaveRoom]: (state, action) =>
    reducers.reduceLeaveRoom(state, action.payload),
  [takeSeat]: (state, action) => reducers.reduceTakeSeat(state, action.payload),
});

module.exports = players;
