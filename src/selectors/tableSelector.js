const { createSelector } = require('reselect');
const { memoize, orderBy } = require('lodash');

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
  return next ? next : seats[0];
};

exports.allTablesById = allTablesById;
exports.allTablesByArray = allTablesByArray;
exports.getTableById = getTableById;
exports.getNextActiveSeat = getNextActiveSeat;
