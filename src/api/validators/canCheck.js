const canCheck = (playerId, table) => {
  //if (isPlayerOnTable(socket.id)) {
  //  var tableId = players[socket.id].sittingOnTable;
  //  var activeSeat = tables[tableId].public.activeSeat;
  //  if (
  //    (tables[tableId] &&
  //      tables[tableId].seats[activeSeat].socket.id === socket.id &&
  //      !tables[tableId].public.biggestBet) ||
  //    (tables[tableId].public.phase === 'preflop' &&
  //      tables[tableId].public.biggestBet === players[socket.id].public.bet &&
  //      ['preflop', 'flop', 'turn', 'river'].indexOf(
  //        tables[tableId].public.phase
  //      ) > -1)
  //  ) {
  return true;
};

module.exports = canCheck;
