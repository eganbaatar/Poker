const { createAction } = require('@reduxjs/toolkit');

const register = createAction('REGISTER');
const enterRoom = createAction('ENTER_ROOM');
const leaveRoom = createAction('LEAVE_ROOM');
const takeSeat = createAction('TAKE_SEAT');
const startRound = createAction('START_ROUND');
const endRound = createAction('END_ROUND');
const postBlind = createAction('POST_BLIND');
const deal = createAction('DEAL');
const act = createAction('ACT');

exports.register = register;
exports.enterRoom = enterRoom;
exports.leaveRoom = leaveRoom;
exports.takeSeat = takeSeat;
exports.startRound = startRound;
exports.endRound = endRound;
exports.postBlind = postBlind;
exports.deal = deal;
exports.act = act;
