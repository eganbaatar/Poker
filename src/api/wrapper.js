const getPublicSeatInfos = (table) => {
  return [];
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
    //  pot TODO not implemented yet
    phase,
    board,
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
