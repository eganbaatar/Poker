const { get, isNil, find, orderBy, maxBy } = require('lodash');

const getPublicSeatInfos = (table, players) => {
  const seats = table.seats;
  let result = Array(table.seatsCount).fill(null);
  for (let i = 0; i < table.seatsCount; i++) {
    const seat = find(seats, { position: i });
    if (isNil(seat)) {
      continue;
    }
    const { playerId, bet, cards, chipsInPlay, inHand, sittingOut } = seat;
    const player = find(players, { id: playerId });
    result[i] = {
      bet,
      cards: [],
      chipsInPlay,
      hasCards: cards.length > 0,
      inHand,
      name: player.name,
      sittingIn: !sittingOut,
    };
  }
  return result;
};

const padBoard = (board) => {
  return ['', '', '', '', ''];
};

const getPublicTableData = (table, players) => {
  const {
    id,
    name,
    seatsCount,
    activeSeatsCount,
    smallBlind,
    bigBlind,
    minBuyIn,
    maxBuyIn,
    minActionTimeout,
    maxActionTimeout,
    button,
    toAct,
    phase,
    board,
  } = table;
  return {
    id,
    name,
    seatsCount,
    playersSeatedCount: activeSeatsCount,
    smallBlind,
    bigBlind,
    minBuyIn,
    maxBuyIn,
    minActionTimeout,
    maxActionTimeout,
    dealerSeat: button,
    activeSeat: toAct,
    seats: getPublicSeatInfos(table, players),
    lastRaise: getLastRaise(table),
    biggestBet: getBiggestBet(table),
    //  pot TODO not implemented yet
    phase,
    board: padBoard(board),
    log: {}, // TODO do not extract log data from table data in frontend
  };
};

const getTableDataForLobby = (table) => {
  return {
    id: table.id,
    name: table.name,
    seatsCount: table.seatsCount,
    playersSeatedCount: table.activeSeatsCount,
    bigBlind: table.bigBlind,
    smallBlind: table.smallBlind,
  };
};

const getLastRaise = (table) => {
  const orderedSeats = orderBy(
    table.seats.filter((seat) => !isNil(seat)),
    ['bet'],
    ['desc']
  );
  return orderedSeats.length > 1
    ? orderedSeats[0].bet - orderedSeats[1].bet
    : 0;
};

const getBiggestBet = (table) => {
  return get(
    maxBy(
      table.seats.filter((seat) => !isNil(seat)),
      'bet'
    ),
    'bet',
    0
  );
};

const getCallAmount = (table, playerId) => {
  const biggestBet = getBiggestBet(table);
  const seat = find(table.seats, (seat) => {
    return seat && seat.id === playerId;
  });
  return biggestBet - seat.bet;
};

exports.getPublicTableData = getPublicTableData;
exports.getTableDataForLobby = getTableDataForLobby;
exports.getLastRaise = getLastRaise;
exports.getBiggestBet = getBiggestBet;
exports.getCallAmount = getCallAmount;