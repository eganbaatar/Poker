const { createAction } = require('@reduxjs/toolkit');

const register = createAction('REGISTER');
const enterRoom = createAction('ENTER_ROOM');
const leaveRoom = createAction('LEAVE_ROOM');
const takeSeat = createAction('TAKE_SEAT');
const startRound = createAction('START_ROUND');

exports.register = register;
exports.enterRoom = enterRoom;
exports.leaveRoom = leaveRoom;
exports.takeSeat = takeSeat;
exports.startRound = startRound;
