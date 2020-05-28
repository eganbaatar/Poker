const getPublicTableData = () => {};
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
