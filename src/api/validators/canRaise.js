//if (isPlayerOnTable(socket.id)) {
//  var tableId = players[socket.id].sittingOnTable;
//  var activeSeat = tables[tableId].public.activeSeat;
//
//  if (
//    // The table exists
//    typeof tables[tableId] !== 'undefined' &&
//    // The player who should act is the player who raised
//    tables[tableId].seats[activeSeat].socket.id === socket.id &&
//    // The pot was betted
//    tables[tableId].public.biggestBet &&
//    // It's not a round of blinds
//    ['preflop', 'flop', 'turn', 'river'].indexOf(tables[tableId].public.phase) >
//      -1 &&
//    // Not every other player is all in (in which case the only move is "call")
//    !tables[tableId].otherPlayersAreAllIn()
//  ) {
//    amount = parseInt(amount);
//    if (amount && isFinite(amount)) {
//      amount -= tables[tableId].seats[activeSeat].public.bet;
//      if (amount <= tables[tableId].seats[activeSeat].public.chipsInPlay) {
//        // Sending the callback first, because the next functions may need to send data to the same player, that shouldn't be overwritten
//        callback({ success: true });
//        // The amount should not include amounts previously betted
//        tables[tableId].playerRaised(amount);
//      }
//    }
//  }
//}
const canRaise = () => {
  return true;
};

module.exports = canRaise;
