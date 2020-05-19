const { createAction } = require('@reduxjs/toolkit');

const register = createAction('REGISTER');
const enterRoom = createAction('ENTER_ROOM');
const leaveRoom = createAction('LEAVE_ROOM');
const takeSeat = createAction('TAKE_SEAT');
const startRound = createAction('START_ROUND');
const postSmallBlind = createAction('POST_SMALL_BLIND');
const postBigBlind = createAction('POST_BIG_BLIND');

exports.register = register;
exports.enterRoom = enterRoom;
exports.leaveRoom = leaveRoom;
exports.takeSeat = takeSeat;
exports.startRound = startRound;
exports.postSmallBlind = postSmallBlind;
exports.postBigBlind = postBigBlind;
