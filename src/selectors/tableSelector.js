const { createSelector } = require('reselect');
const { memoize, get, orderBy, isNil, find, maxBy } = require('lodash');

const allTablesById = (state) => state.byId;

const allTablesByArray = (state) => Object.values(state.byId);

const getTableById = createSelector(allTablesById, (tableMap) =>
  memoize((id) => tableMap[id])
);

const findSeat = (seats, position, orderDirection, filterFn) => {
  const orderedActiveSeats = orderBy(
    seats.filter(filterFn),
    ['position'],
    [orderDirection]
  );
  const next = orderedActiveSeats.find((seat) => {
    return orderDirection === 'asc'
      ? seat.position > position
      : seat.position < position;
  });
  return isNil(next) ? orderedActiveSeats[0] : next;
};

/**
 * search next seat (in the left side) which is
 *   - not sitting out
 *   - has chips
 *
 * @param {object[]} seats
 * @param {number} position
 */
const getNextActiveSeat = (seats, position) => {
  return findSeat(
    seats,
    position,
    'asc',
    (seat) => seat && seat.chipsInPlay > 0 && seat.sittingOut != true
  );
};
const getPreviousActiveSeat = (seats, position) => {
  return findSeat(
    seats,
    position,
    'desc',
    (seat) => seat && seat.chipsInPlay > 0 && seat.sittingOut != true
  );
};
const getNextActiveSeatInHand = (seats, position) => {
  return findSeat(
    seats,
    position,
    'asc',
    (seat) =>
      seat &&
      seat.chipsInPlay > 0 &&
      seat.sittingOut != true &&
      seat.inHand === true
  );
};
const getPreviousActiveSeatInHand = (seats, position) => {
  return findSeat(
    seats,
    position,
    'desc',
    (seat) =>
      seat &&
      seat.chipsInPlay > 0 &&
      seat.sittingOut != true &&
      seat.inHand === true
  );
};

/**
 * @returns shallow copy of seats ordered by position but starts from given position
 */
const rotateSeatsToPosition = (seats, position) => {
  if (isNil(find(seats, { position }))) {
    return seats;
  }
  const seatsAfter = orderBy(
    seats.filter((seat) => seat.position >= position),
    ['position'],
    ['asc']
  );

  const seatsBefore = orderBy(
    seats.filter((seat) => seat.position < position),
    ['position'],
    ['asc']
  );
  return seatsAfter.concat(seatsBefore);
};

const getBiggestBet = (table) => {
  return get(maxBy(table.seats, 'bet'), 'bet', 0);
};

exports.allTablesById = allTablesById;
exports.allTablesByArray = allTablesByArray;
exports.getTableById = getTableById;
exports.getNextActiveSeat = getNextActiveSeat;
exports.getPreviousActiveSeat = getPreviousActiveSeat;
exports.getNextActiveSeatInHand = getNextActiveSeatInHand;
exports.getPreviousActiveSeatInHand = getPreviousActiveSeatInHand;
exports.rotateSeatsToPosition = rotateSeatsToPosition;
exports.getBiggestBet = getBiggestBet;
