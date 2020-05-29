const { isNil } = require('lodash');

const getPublicSeatInfos = (table) => {
  const seats = table.seats;
  let result = Array(table.seatsCount).fill(null);
  for (let i = 0; i < seats.length; i++) {
    const seat = seats[i];
    if (isNil(seat)) {
      return;
    }
    const { bet, cards, chipsInPlay, hasCards, inHand, name, sittingIn } = seat;
    result[i] = {
      bet,
      cards,
      chipsInPlay,
      hasCards: cards.length > 0,
      inHand,
      name,
      sittingIn,
    };
  }
  return result;
};

const padBoard = (board) => {
  return ['', '', '', '', ''];
};

const getPublicTableData = (table) => {
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
    seats,
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
    seats: getPublicSeatInfos(table),
    // lastRaise: , TODO
    // biggestBet: , TODO
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

exports.getPublicTableData = getPublicTableData;
exports.getTableDataForLobby = getTableDataForLobby;
