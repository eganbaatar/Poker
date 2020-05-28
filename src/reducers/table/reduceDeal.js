const { times } = require('lodash');
const {
  getTableById,
  getNextActiveSeat,
  rotateSeatsToPosition,
} = require('../../selectors/tableSelector');
const deck = require('../../utils/deck');

const reduceDeal = (state, { tableId }) => {
  const table = getTableById(state)(tableId);
  if (table.phase === 'preFlop') {
    // set shuffled deck into table
    table.deck = deck.shuffle();
    table.dealt = [];

    const nextSeatToButton = getNextActiveSeat(table.seats, table.button);

    // deal cards to seats beginning with position after button
    const orderedActiveSeats = rotateSeatsToPosition(
      table.seats.filter(
        (seat) => seat && seat.chipsInPlay > 0 && seat.sittingOut != true
      ),
      nextSeatToButton.position
    );

    times(2, (iteration) => {
      orderedActiveSeats.forEach((seat) => {
        if (iteration === 0) {
          seat.cards = [];
        }
        const { dealt, remaining } = deck.deal(table.deck, 1);
        seat.cards = seat.cards.concat(dealt);
        table.dealt = table.dealt.concat(dealt);
        table.deck = remaining;
      });
    });
    return;
  }
  const dealCount = table.phase === 'flop' ? 4 : 2;
  const { dealt, remaining } = deck.deal(table.deck, dealCount);
  table.dealt = table.dealt.concat(dealt);
  table.deck = remaining;
  table.board = table.board.concat(dealt.splice(1, dealCount - 1));
};

module.exports = reduceDeal;
