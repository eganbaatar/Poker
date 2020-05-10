const event = require('./socket-event');
const { iNil, get } = require('lodash');
const tables = require('./tables');

// reference to io instance
let io;
let players = {};

const isPlayerOnTable = (players, pid) => {
  const playerInfo = players[pid];
  return (
    !_.isNil(playerInfo) &&
    !_.isNil(playerInfo.sittingOnTable) &&
    playerInfo.sittingOnTable !== false
  );
};

const handleEnterRoom = (tableId, socket) => {
  const player = getPlayer(socket.id);
  if (!player || !isNil(player.room)) {
    return;
  }
  socket.join(`table-${tableId}`);
  player.room = tableId;
};

/**
 * When a player leaves a room
 */
const handleLeaveRoom = (socket) => {
  const player = getPlayer(socket.id);
  if (!isNil(get(player, 'room')) && !isPlayerOnTable()) {
    socket.leave('table-' + player.room);
    player.room = null;
  }
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
    isPlayerOnTable(players, socket.id) &&
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
 * @param string newScreenName
 * @param function callback
 */
const handleRegister = (newScreenName, socket, callback) => {
  if (isNil(newScreenName)) {
    callback({ success: false, message: '' });
  }

  var newScreenName = newScreenName.trim();
  // If the new screen name is not an empty string
  if (newScreenName && typeof players[socket.id] === 'undefined') {
    var nameExists = false;
    for (var i in players) {
      if (players[i].public.name && players[i].public.name == newScreenName) {
        nameExists = true;
        break;
      }
    }
    if (!nameExists) {
      // Creating the player object

      players[socket.id] = new Player(socket, newScreenName, 10000);
      socket.handshake.session.player = 'kardun';
      socket.handshake.session.save();
      callback({
        success: true,
        screenName: newScreenName,
        totalChips: players[socket.id].chips,
      });
    } else {
      callback({ success: false, message: 'This name is taken' });
    }
  } else {
    callback({ success: false, message: 'Please enter a screen name' });
  }
};

/**
 * When a player requests to sit on a table
 * @param function callback
 */
const handleSitOnTheTable = (data, callback, socket) => {
  if (
    // A seat has been specified
    typeof data.seat !== 'undefined' &&
    // A table id is specified
    typeof data.tableId !== 'undefined' &&
    // The table exists
    typeof tables[data.tableId] !== 'undefined' &&
    // The seat number is an integer and less than the total number of seats
    typeof data.seat === 'number' &&
    data.seat >= 0 &&
    data.seat < tables[data.tableId].public.seatsCount &&
    typeof players[socket.id] !== 'undefined' &&
    // The seat is empty
    tables[data.tableId].seats[data.seat] == null &&
    // The player isn't sitting on any other tables
    players[socket.id].sittingOnTable === false &&
    // The player had joined the room of the table
    players[socket.id].room === data.tableId &&
    // The chips number chosen is a number
    typeof data.chips !== 'undefined' &&
    !isNaN(parseInt(data.chips)) &&
    isFinite(data.chips) &&
    // The chips number is an integer
    data.chips % 1 === 0
  ) {
    // The chips the player chose are less than the total chips the player has
    if (data.chips > players[socket.id].chips)
      callback({ success: false, error: "You don't have that many chips" });
    else if (
      data.chips > tables[data.tableId].public.maxBuyIn ||
      data.chips < tables[data.tableId].public.minBuyIn
    )
      callback({
        success: false,
        error:
          'The amount of chips should be between the maximum and the minimum amount of allowed buy in',
      });
    else {
      // Give the response to the user
      callback({ success: true });
      // Add the player to the table
      tables[data.tableId].playerSatOnTheTable(
        players[socket.id],
        data.seat,
        data.chips
      );
    }
  } else {
    // If the user is not allowed to sit in, notify the user
    callback({ success: false });
  }
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
  if (isPlayerOnTable(players, socket.id)) {
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
  if (isPlayerOnTable(players, socket.id)) {
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
  if (isPlayerOnTable(players, socket.id)) {
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
  if (isPlayerOnTable(players, socket.id)) {
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
  if (isPlayerOnTable(players, socket.id)) {
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
  if (isPlayerOnTable(players, socket.id)) {
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
  if (isPlayerOnTable(players, socket.id)) {
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
      handleSitOnTheTable(data, callback, socket)
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
