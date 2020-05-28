const { find } = require('lodash');
const {
  getTableById,
  getNextActiveSeatInHand,
  getPreviousActiveSeatInHand,
} = require('../../selectors/tableSelector');

const reduceAct = (state, { tableId, seat, type, amount = 0 }) => {
  const table = getTableById(state)(tableId);
  let actingSeat = find(table.seats, { position: seat });
  switch (type) {
    case 'BET':
    case 'RAISE':
      actingSeat.chipsInPlay =
        actingSeat.chipsInPlay >= amount ? actingSeat.chipsInPlay - amount : 0;
      actingSeat.bet += amount;
      table.toAct = getNextActiveSeatInHand(table.seats, seat).position;
      table.lastPlayerToAct = getPreviousActiveSeatInHand(
        table.seats,
        seat
      ).position;
      break;
    case 'CALL':
      actingSeat.chipsInPlay =
        actingSeat.chipsInPlay >= amount ? actingSeat.chipsInPlay - amount : 0;
      actingSeat.bet += amount;
      table.toAct = getNextActiveSeatInHand(table.seats, seat).position;
      break;
    case 'CHECK':
      table.toAct = getNextActiveSeatInHand(table.seats, seat).position;
      break;
    case 'FOLD':
      table.toAct = getNextActiveSeatInHand(table.seats, seat).position;
      actingSeat.inHand = false;
      break;
    default:
      throw Error(`invalid player action type ${type}`);
  }
};

module.exports = reduceAct;
