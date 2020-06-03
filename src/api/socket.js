const event = require('./socket-event');
const { isNil, get, isInteger } = require('lodash');
const store = require('../models/store');
const {
  register,
  enterRoom,
  leaveRoom,
  takeSeat,
  startRound,
} = require('../actions');
const {
  getPlayerById,
  getPlayerByName,
  allPlayersByArray,
} = require('../selectors/playersSelector');
const { getTableById } = require('../selectors/tableSelector');
const { getPublicTableData } = require('./wrapper');

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

  // not sure what these lines do, maybe remove?
  socket.handshake.session.player = 'kardun';
  socket.handshake.session.save();

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
const handleSitOnTheTable = (data, callback, socket, io) => {
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

  const tableData = getPublicTableData(
    getTableById(tablesSlice())(tableId),
    allPlayersByArray(playersSlice())
  );
  callback({ success: true });
  io.sockets.in(`table-${tableId}`).emit('table-data', tableData);
};

/**
 * When a player who sits on the table but is not sitting in, requests to sit in
 * @param function callback
 */
const handleSitIn = (callback, socket) => {
  if (
    players[socket.id] &&
    players[socket.id].sittingOnTable !== false &&
    players[socket.id].seat !== null &&
    !players[socket.id].public.sittingIn
  ) {
    // Getting the table id from the player object
    var tableId = players[socket.id].sittingOnTable;
    tables[tableId].playerSatIn(players[socket.id].seat);
    callback({ success: true });
  }
};

/**
 * When a player posts a blind
 * @param bool postedBlind (Shows if the user posted the blind or not)
 * @param function callback
 */
const handlePostBlind = (postedBlind, callback, socket) => {
  if (isPlayerOnTable(socket.id)) {
    var tableId = players[socket.id].sittingOnTable;
    var activeSeat = tables[tableId].public.activeSeat;

    if (
      tables[tableId] &&
      typeof tables[tableId].seats[activeSeat].public !== 'undefined' &&
      tables[tableId].seats[activeSeat].socket.id === socket.id &&
      (tables[tableId].public.phase === 'smallBlind' ||
        tables[tableId].public.phase === 'bigBlind')
    ) {
      if (postedBlind) {
        callback({ success: true });
        if (tables[tableId].public.phase === 'smallBlind') {
          // The player posted the small blind
          tables[tableId].playerPostedSmallBlind();
        } else {
          // The player posted the big blind
          tables[tableId].playerPostedBigBlind();
        }
      } else {
        tables[tableId].playerSatOut(players[socket.id].seat);
        callback({ success: true });
      }
    }
  }
};

/**
 * When a player checks
 * @param function callback
 */
const handleCheck = (callback, socket) => {
  if (isPlayerOnTable(socket.id)) {
    var tableId = players[socket.id].sittingOnTable;
    var activeSeat = tables[tableId].public.activeSeat;

    if (
      (tables[tableId] &&
        tables[tableId].seats[activeSeat].socket.id === socket.id &&
        !tables[tableId].public.biggestBet) ||
      (tables[tableId].public.phase === 'preflop' &&
        tables[tableId].public.biggestBet === players[socket.id].public.bet &&
        ['preflop', 'flop', 'turn', 'river'].indexOf(
          tables[tableId].public.phase
        ) > -1)
    ) {
      // Sending the callback first, because the next functions may need to send data to the same player, that shouldn't be overwritten
      callback({ success: true });
      tables[tableId].playerChecked();
    }
  }
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
  if (isPlayerOnTable(socket.id)) {
    var tableId = players[socket.id].sittingOnTable;
    var activeSeat = tables[tableId].public.activeSeat;

    if (
      tables[tableId] &&
      tables[tableId].seats[activeSeat].socket.id === socket.id &&
      tables[tableId].public.biggestBet &&
      ['preflop', 'flop', 'turn', 'river'].indexOf(
        tables[tableId].public.phase
      ) > -1
    ) {
      // Sending the callback first, because the next functions may need to send data to the same player, that shouldn't be overwritten
      callback({ success: true });
      tables[tableId].playerCalled();
    }
  }
};

/**
 * When a player bets
 * @param number amount
 * @param function callback
 */
const handleBet = (amount, callback, socket) => {
  if (isPlayerOnTable(socket.id)) {
    var tableId = players[socket.id].sittingOnTable;
    var activeSeat = tables[tableId].public.activeSeat;

    if (
      tables[tableId] &&
      tables[tableId].seats[activeSeat].socket.id === socket.id &&
      !tables[tableId].public.biggestBet &&
      ['preflop', 'flop', 'turn', 'river'].indexOf(
        tables[tableId].public.phase
      ) > -1
    ) {
      // Validating the bet amount
      amount = parseInt(amount);
      if (
        amount &&
        isFinite(amount) &&
        amount <= tables[tableId].seats[activeSeat].public.chipsInPlay
      ) {
        // Sending the callback first, because the next functions may need to send data to the same player, that shouldn't be overwritten
        callback({ success: true });
        tables[tableId].playerBetted(amount);
      }
    }
  }
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
        message: htmlEntities(message),
        sender: players[socket.id].public.name,
      });
  }
};

/**
 * Changes certain characters in a string to html entities
 * @param string str
 */
function htmlEntities(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const init = (_io) => {
  io = _io;
  addListeners();
};

const getPlayer = (id) => {
  return players[id];
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
    socket.on(event.sitIn, (callback) => handleSitIn(callback, socket));
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

/**
 * Event emitter function that will be sent to the table objects
 * Tables use the eventEmitter in order to send events to the client
 * and update the table data in the ui
 * @param string tableId
 */
const eventEmitter = (tableId) => (eventName, eventData) => {
  io.sockets.in('table-' + tableId).emit(eventName, eventData);
};

exports.init = init;
exports.eventEmitter = eventEmitter;
exports.handleSitOnTheTable = handleSitOnTheTable;
