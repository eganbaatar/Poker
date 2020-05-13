const { createAction } = require('@reduxjs/toolkit');

const register = createAction('REGISTER');
const enterRoom = createAction('ENTER_ROOM');
const leaveRoom = createAction('LEAVE_ROOM');
const takeSeat = createAction('TAKE_SEAT');
const startGame = createAction('START_GAME');

exports.register = register;
exports.enterRoom = enterRoom;
exports.leaveRoom = leaveRoom;
exports.takeSeat = takeSeat;
exports.startGame = startGame;
