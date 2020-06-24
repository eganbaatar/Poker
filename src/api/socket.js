const event = require('./socket-event');
const { isNil, get, isInteger, find } = require('lodash');
const store = require('../models/store');
const {
  act,
  enterRoom,
  leaveRoom,
  postBlind,
  register,
  startNewPhase,
  startRound,
  takeSeat,
} = require('../actions');
const {
  getPlayerById,
  getPlayerByName,
  allPlayersByArray,
} = require('../selectors/playersSelector');
const { canPostBlind, canCheck, canCall, canBet } = require('./validators');
const { getTableById } = require('../selectors/tableSelector');
const { getPublicTableData, getCallAmount } = require('./wrapper');

const INITIAL_CHIPS_AMOUNT = 10000;

// reference to io instance
let io;

const playersSlice = () => {
  return store.getState().players;
};
const tablesSlice = () => {
  return store.getState().tables;
};

const isPlayerOnTable = (playerId) => {
  const player = getPlayerById(store.getState().players)(playerId);

  return get(player, 'seat') > 0;
};

const handleEnterRoom = (tableId, socket) => {
  const player = getPlayerById(playersSlice(store))(socket.id);
  if (!player || !isNil(player.room)) {
    return;
  }

  store.dispatch(enterRoom({ playerId: socket.id, tableId }));
  socket.join(`table-${tableId}`);
};

/**
 * When a player leaves a room
 */
const handleLeaveRoom = (socket) => {
  const player = getPlayerById(playersSlice(store))(socket.id);
  // player not sitting on a table
  if (!player || isNil(player.room) || player.seat > 0) {
    return;
  }
  store.dispatch(leaveRoom({ playerId: socket.id }));
  socket.leave(`table-${player.room}`);
};

/**
 * When a player disconnects
 */
const handleDisconnect = (socket) => {
  // If the socket points to a player object
  if (typeof players[socket.id] !== 'undefined') {
    // If the player was sitting on a table
    if (
      players[socket.id].sittingOnTable !== false &&
      typeof tables[players[socket.id].sittingOnTable] !== 'undefined'
    ) {
      // The seat on which the player was sitting
      var seat = players[socket.id].seat;
      // The table on which the player was sitting
      var tableId = players[socket.id].sittingOnTable;
      // Remove the player from the seat
      tables[tableId].playerLeft(seat);
    }
    // Remove the player object from the players array
    delete players[socket.id];
  }
};

/**
 * When a player leaves the table
 * @param function callback
 */
const handleLeaveTable = (callback, socket) => {
  // If the player was sitting on a table
  if (
    isPlayerOnTable(socket.id) &&
    tables[players[socket.id].sittingOnTable] !== false
  ) {
    // The seat on which the player was sitting
    var seat = players[socket.id].seat;
    // The table on which the player was sitting
    var tableId = players[socket.id].sittingOnTable;
    // Remove the player from the seat
    tables[tableId].playerLeft(seat);
    // Send the number of total chips back to the user
    callback({ success: true, totalChips: players[socket.id].chips });
  }
};

/**
 * When a new player enters the application
 * @param string screenName
 * @param function callback
 */
const handleRegister = (_screenName, socket, callback) => {
  const players = playersSlice();
  const screenName = _screenName.trim();

  if (isNil(screenName)) {
    return callback({ success: false, message: '' });
  }

  const player = getPlayerById(players)(socket.id);

  // Player with socket id already exists
  if (!isNil(player)) {
    return callback({ success: false, message: 'Please enter a screen name' });
  }

  // If player with same name exists
  if (getPlayerByName(players)(screenName)) {
    return callback({ success: false, message: 'This name is taken' });
  }

  // Creating the player object
  store.dispatch(
    register({ id: socket.id, name: screenName, chips: INITIAL_CHIPS_AMOUNT })
  );

  callback({
    success: true,
    screenName: screenName,
    totalChips: INITIAL_CHIPS_AMOUNT,
  });
};

/**
 * When a player requests to sit on a table
 * @param function callback
 */
const handleSitOnTheTable = (data, callback, socket) => {
  const { seat, tableId, chips } = data;
  if (isNil(seat) || isNil(tableId) || isNil(chips)) {
    callback({ success: false, error: 'invalid data' });
  }

  let player = getPlayerById(playersSlice())(socket.id);
  let table = getTableById(tablesSlice())(tableId);

  /*
   * Data defined but incorrect
   *  - table not exist
   *  - seat number is not integer number
   *  - invalid seat number
   *  - seat is not empty
   *  - player sits already in table
   *  - player not in the room
   *  - chip number is not integer
   */
  if (
    !table ||
    !isInteger(seat) ||
    seat < 0 ||
    seat > table.seatsCount ||
    !isNil(table.seats[seat]) ||
    player.seat >= 0 ||
    player.room != tableId ||
    !isInteger(chips)
  ) {
    return callback({ success: false, error: 'invalid data' });
  }

  if (chips > player.chips) {
    return callback({ success: false, error: 'Not enough chips' });
  }

  if (chips > table.maxBuyIn || chips < table.minBuyIn) {
    return callback({
      success: false,
      error:
        'The amount of chips should be between the maximum and the minimum amount of allowed buy in',
    });
  }

  store.dispatch(takeSeat({ playerId: socket.id, tableId, seat, chips }));

  table = getTableById(tablesSlice())(tableId);

  // game will start if more than 1 player sitting and game is not on
  if (!table.gameOn && table.activeSeatsCount > 1) {
    store.dispatch(startRound({ tableId }));
  }

  callback({ success: true });
  emitPublicData(tableId);
  emitNextAction(tableId);
};

/**
 * When a player posts a blind
 * @param bool postedBlind (Shows if the user posted the blind or not)
 * @param function callback
 */
const handlePostBlind = (postedBlind, callback, socket) => {
  const player = getPlayerById(playersSlice())(socket.id);
  const table = getTableById(tablesSlice())(player.room);

  if (!canPostBlind(socket.id, table)) {
    callback({ success: false, error: 'not allowed to post blind' });
  }

  store.dispatch(
    postBlind({ tableId: table.id, isSmallBlind: table.phase === 'smallBlind' })
  );

  callback({ success: true });
  emitPublicData(table.id);
  emitNextAction(table.id);
};

/**
 * When a player checks
 * @param function callback
 */
const handleCheck = (callback, socket) => {
  const player = getPlayerById(playersSlice())(socket.id);
  let table = getTableById(tablesSlice())(player.room);
  if (!canCheck(socket.id, table)) {
    callback({ success: false, error: 'check not allowed' });
  }
  const isLastToAct = table.lastPlayerToAct === table.toAct;
  store.dispatch(act({ tableId: table.id, seat: table.toAct, type: 'CHECK' }));
  callback({ success: true });

  table = getTableById(tablesSlice())(player.room);

  // not last player to act then pass action to next player
  if (!isLastToAct) {
    emitPublicData(table.id);
    emitNextAction(table.id);
    return;
  }

  handleLastAct(table);
};

/**
 * When a player folds
 * @param function callback
 */
const handleFold = (callback, socket) => {
  if (isPlayerOnTable(socket.id)) {
    var tableId = players[socket.id].sittingOnTable;
    var activeSeat = tables[tableId].public.activeSeat;

    if (
      tables[tableId] &&
      tables[tableId].seats[activeSeat].socket.id === socket.id &&
      ['preflop', 'flop', 'turn', 'river'].indexOf(
        tables[tableId].public.phase
      ) > -1
    ) {
      // Sending the callback first, because the next functions may need to send data to the same player, that shouldn't be overwritten
      callback({ success: true });
      tables[tableId].playerFolded();
    }
  }
};

/**
 * When a player calls
 * @param function callback
 */
const handleCall = (callback, socket) => {
  const player = getPlayerById(playersSlice())(socket.id);
  const table = getTableById(tablesSlice())(player.room);
  if (!canCall(socket.id, table)) {
    callback({ success: false, error: 'call not allowed' });
  }

  const isLastToAct = table.lastPlayerToAct === table.toAct;
  store.dispatch(
    act({
      tableId: table.id,
      seat: table.toAct,
      type: 'CALL',
      amount: getCallAmount(table),
    })
  );

  callback({ success: true });
  // not last player to act then pass action to next player
  if (!isLastToAct) {
    emitPublicData(table.id);
    emitNextAction(table.id);
    return;
  }

  handleLastAct(table.id);
};

/**
 * When a player bets
 * @param number amount
 * @param function callback
 */
const handleBet = (amount, callback, socket) => {
  const player = getPlayerById(playersSlice())(socket.id);
  const table = getTableById(tablesSlice())(player.room);
  if (!canBet(socket.id, table)) {
    callback({ success: false, error: 'bet not allowed' });
  }

  const isLastToAct = table.lastPlayerToAct === table.toAct;
  store.dispatch(
    act({
      tableId: table.id,
      seat: table.toAct,
      type: 'BET',
      amount,
    })
  );

  callback({ success: true });
  // not last player to act then pass action to next player
  if (!isLastToAct) {
    emitPublicData(table.id);
    emitNextAction(table.id);
    return;
  }

  handleLastAct(table.id);
};

/**
 * When a player raises
 * @param function callback
 */
const handleRaise = (amount, callback, socket) => {
  if (isPlayerOnTable(socket.id)) {
    var tableId = players[socket.id].sittingOnTable;
    var activeSeat = tables[tableId].public.activeSeat;

    if (
      // The table exists
      typeof tables[tableId] !== 'undefined' &&
      // The player who should act is the player who raised
      tables[tableId].seats[activeSeat].socket.id === socket.id &&
      // The pot was betted
      tables[tableId].public.biggestBet &&
      // It's not a round of blinds
      ['preflop', 'flop', 'turn', 'river'].indexOf(
        tables[tableId].public.phase
      ) > -1 &&
      // Not every other player is all in (in which case the only move is "call")
      !tables[tableId].otherPlayersAreAllIn()
    ) {
      amount = parseInt(amount);
      if (amount && isFinite(amount)) {
        amount -= tables[tableId].seats[activeSeat].public.bet;
        if (amount <= tables[tableId].seats[activeSeat].public.chipsInPlay) {
          // Sending the callback first, because the next functions may need to send data to the same player, that shouldn't be overwritten
          callback({ success: true });
          // The amount should not include amounts previously betted
          tables[tableId].playerRaised(amount);
        }
      }
    }
  }
};

/**
 * When a player goes all in
 * @param function callback
 */
const handleAllIn = (callback, socket) => {
  if (isPlayerOnTable(socket.id)) {
    var tableId = players[socket.id].sittingOnTable;
    var activeSeat = tables[tableId].public.activeSeat;

    if (
      // The table exists
      typeof tables[tableId] !== 'undefined' &&
      // The player who should act is the player who raised
      tables[tableId].seats[activeSeat].socket.id === socket.id &&
      // It's not a round of blinds
      ['preflop', 'flop', 'turn', 'river'].indexOf(
        tables[tableId].public.phase
      ) > -1 &&
      // Not every other player is all in (in which case the only move is "call")
      !tables[tableId].otherPlayersAreAllIn()
    ) {
      amount = tables[tableId].seats[activeSeat].public.chipsInPlay;
      if (amount && isFinite(amount)) {
        // Sending the callback first, because the next functions may need to send data to the same player, that shouldn't be overwritten
        callback({ success: true });
        if (tables[tableId].public.biggestBet) {
          tables[tableId].playerRaised(amount);
        } else {
          tables[tableId].playerBetted(amount);
        }
      }
    }
  }
};

/**
 * When a message from a player is sent
 * @param string message
 */
const handleSendMessage = (message, socket) => {
  message = message.trim();
  if (message && players[socket.id].room) {
    socket.broadcast
      .to('table-' + players[socket.id].room)
      .emit('receiveMessage', {
        message,
        sender: players[socket.id].public.name,
      });
  }
};

/**
 * If player is last to act and did not raised.
 */
function handleLastAct(table) {
  const tableId = table.id;
  if (table.phase !== 'river') {
    store.dispatch(startNewPhase({ tableId }));
    emitPublicData(tableId);
    emitNextAction(tableId);
    return;
  }

  // player is last to act in the river phase then show down and end this round
  store.dispatch(endRound({ tableId }));
  emitShowDownCards(tableId);

  store.dispatch(startRound({ tableId }));
  emitPublicData(tableId);
  emitNextAction(tableId);
}

const init = (_io) => {
  io = _io;
  addListeners();
};

const addListeners = () => {
  io.sockets.on('connection', (socket) => {
    socket.on(event.enterRoom, (tableId) => handleEnterRoom(tableId, socket));
    socket.on(event.leaveRoom, () => handleLeaveRoom(socket));
    socket.on(event.register, (name, callback) =>
      handleRegister(name, socket, callback)
    );
    socket.on(event.sitOnTheTable, (data, callback) =>
      handleSitOnTheTable(data, callback, socket, io)
    );
    socket.on(event.postBlind, (postBlind, callback) =>
      handlePostBlind(postBlind, callback, socket)
    );
    socket.on(event.check, (callback) => handleCheck(callback, socket));
    socket.on(event.fold, (callback) => handleFold(callback, socket));
    socket.on(event.call, (callback) => handleCall(callback, socket));
    socket.on(event.bet, (amount, callback) =>
      handleBet(amount, callback, socket)
    );
    socket.on(event.raise, (amount, callback) =>
      handleRaise(amount, callback, socket)
    );
    socket.on(event.allIn, (callback) => handleAllIn(callback, socket));
    socket.on(event.sendMessage, (message) =>
      handleSendMessage(message, socket)
    );
    socket.on(event.disconnect, () => handleDisconnect(socket));
    socket.on(event.leaveTable, (callback) =>
      handleLeaveTable(callback, socket)
    );
  });
};

function emitPublicData(tableId) {
  const tableData = getPublicTableData(
    getTableById(tablesSlice())(tableId),
    allPlayersByArray(playersSlice())
  );
  io.sockets.in(`table-${tableId}`).emit('table-data', tableData);
}

function emitNextAction(tableId) {
  const table = getTableById(tablesSlice())(tableId);
  if (!table.gameOn) {
    return;
  }
  const action = getNextAction(table);
  const socketId = find(table.seats, { position: table.toAct }).playerId;
  io.to(socketId).emit(action);
}

function getNextAction(table) {
  const currentPhase = table.phase;
  if (currentPhase === 'smallBlind') {
    return 'postSmallBlind';
  }
  if (currentPhase === 'bigBlind') {
    return 'postBigBlind';
  }
  return isSomePlayerAllIn(table)
    ? 'actOthersAllIn'
    : hasSomePlayerBetted(table)
    ? 'actBettedPot'
    : 'actNotBettedPot';
}

function emitShowDownCards(tableId) {
  console.error('emitShowDownCards() is not implemented!');
}

function isSomePlayerAllIn(table) {
  return !!find(table.seats, (seat) => {
    return seat && seat.inHand === true && seat.chipsInPlay <= 0;
  });
}

function hasSomePlayerBetted(table) {
  return !!find(table.seats, (seat) => {
    return seat && seat.bet > 0;
  });
}

exports.init = init;
exports.handleRegister = handleRegister;
exports.handleEnterRoom = handleEnterRoom;
exports.handleSitOnTheTable = handleSitOnTheTable;
exports.handlePostBlind = handlePostBlind;
exports.handleCall = handleCall;
exports.handleCheck = handleCheck;
exports.handleBet = handleBet;
