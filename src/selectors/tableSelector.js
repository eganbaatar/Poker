const { createSelector } = require('reselect');
const { memoize, orderBy, isNil } = require('lodash');

const allTablesById = (state) => state.byId;

const allTablesByArray = (state) => Object.values(state.byId);

const getTableById = createSelector(allTablesById, (tableMap) =>
  memoize((id) => tableMap[id])
);

/**
 * search next seat (in the left side) which is
 *   - not sitting out
 *   - has chips
 *
 * @param {object[]} seats
 * @param {number} startingPosition
 */
const getNextActiveSeat = (seats, startingPosition) => {
  const orderedActiveSeats = orderBy(
    seats.filter(
      (seat) => seat && seat.chipsInPlay > 0 && seat.sittingOut != true
    ),
    ['position'],
    ['asc']
  );
  const next = orderedActiveSeats.find(
    (seat) => seat.position > startingPosition
  );
  return isNil(next) ? orderedActiveSeats[0] : next;
};

/**
 * @returns shallow copy of seats ordered by position but starts from given position
 */
const rotateSeatsToPosition = (seats, position) => {};

exports.allTablesById = allTablesById;
exports.allTablesByArray = allTablesByArray;
exports.getTableById = getTableById;
exports.getNextActiveSeat = getNextActiveSeat;
exports.rotateSeatsToPosition = rotateSeatsToPosition;
