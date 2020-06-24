/*if (isPlayerOnTable(socket.id)) {
  var tableId = players[socket.id].sittingOnTable;
  var activeSeat = tables[tableId].public.activeSeat;

  if (
    tables[tableId] &&
    tables[tableId].seats[activeSeat].socket.id === socket.id &&
    !tables[tableId].public.biggestBet &&
    ['preflop', 'flop', 'turn', 'river'].indexOf(tables[tableId].public.phase) >
      -1
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
*/
const canBet = () => {
  return true;
};

module.exports = canBet;
