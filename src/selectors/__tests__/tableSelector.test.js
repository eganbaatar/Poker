const {
  allTablesById,
  allTablesByArray,
  getTableById,
  getNextActiveSeat,
} = require('../../selectors/tableSelector');

describe('tableSelector', () => {
  describe('all tables selector', () => {
    const state = {
      byId: {
        0: {
          id: 0,
          seatCount: 9,
        },
        1: {
          id: 1,
          seatCount: 9,
        },
      },
    };
    test('return all tables as map', () => {
      expect(allTablesById(state)).toEqual(state.byId);
    });

    test('return all tables as array', () => {
      expect(allTablesByArray(state)).toEqual([
        { id: 0, seatCount: 9 },
        { id: 1, seatCount: 9 },
      ]);
    });
  });
  test('return player by id', () => {
    const state = {
      byId: {
        0: {
          id: 0,
        },
        1: {
          id: 1,
        },
      },
    };
    expect(getTableById(state)(1)).toEqual(state.byId[1]);
  });
  describe('getNextActiveSeats', () => {
    test('skip undefined seats if exist', () => {
      const seats = [
        { position: 2, chipsInPlay: 100 },
        null,
        { position: 4, chipsInPlay: 100 },
      ];
      expect(getNextActiveSeat(seats, 2).position).toBe(4);
    });
    test("skip seat with status 'sitting out'", () => {
      const seats = [
        { position: 2, chipsInPlay: 100 },
        { position: 3, chipsInPlay: 230, sittingOut: true },
        { position: 5, chipsInPlay: 100 },
      ];
      expect(getNextActiveSeat(seats, 2).position).toBe(5);
    });
    test('skip seat without chips', () => {
      const seats = [
        { position: 2, chipsInPlay: 100 },
        { position: 3, chipsInPlay: 0 },
        { position: 7, chipsInPlay: 100 },
      ];
      expect(getNextActiveSeat(seats, 2).position).toBe(7);
    });
    test('return first possible seat if start index sits on the right', () => {
      const seats = [
        null,
        null,
        { position: 2, chipsInPlay: 100 },
        { position: 3, chipsInPlay: 200 },
        { position: 4, chipsInPlay: 100 },
      ];
      expect(getNextActiveSeat(seats, 4).position).toBe(2);
    });
  });
});
