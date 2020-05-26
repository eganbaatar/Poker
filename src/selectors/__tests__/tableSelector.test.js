const {
  allTablesById,
  allTablesByArray,
  getTableById,
  getNextActiveSeat,
  getPreviousActiveSeat,
  getNextActiveSeatInHand,
  getPreviousActiveSeatInHand,
  rotateSeatsToPosition,
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
  describe('getPreviousActiveSeat', () => {
    test('skip undefined seats if exist', () => {
      const seats = [
        { position: 2, chipsInPlay: 100 },
        null,
        { position: 3, chipsInPlay: 100 },
        { position: 4, chipsInPlay: 100 },
      ];
      expect(getPreviousActiveSeat(seats, 4).position).toBe(3);
    });
    test("skip seat with status 'sitting out'", () => {
      const seats = [
        { position: 2, chipsInPlay: 100 },
        { position: 3, chipsInPlay: 230, sittingOut: true },
        { position: 5, chipsInPlay: 100 },
      ];
      expect(getPreviousActiveSeat(seats, 5).position).toBe(2);
    });
    test('skip seat without chips', () => {
      const seats = [
        { position: 2, chipsInPlay: 100 },
        { position: 3, chipsInPlay: 0 },
        { position: 5, chipsInPlay: 100 },
        { position: 7, chipsInPlay: 100 },
      ];
      expect(getPreviousActiveSeat(seats, 7).position).toBe(5);
    });
    test('return first possible seat if start index sits on the right', () => {
      const seats = [
        null,
        null,
        { position: 2, chipsInPlay: 100 },
        { position: 3, chipsInPlay: 200 },
        { position: 4, chipsInPlay: 100 },
      ];
      expect(getPreviousActiveSeat(seats, 2).position).toBe(4);
    });
  });
  describe('rotateSeatsToPosition', () => {
    test('do not rotate if position not found', () => {
      const seats = [{ position: 3 }, { position: 5 }];
      expect(rotateSeatsToPosition(seats, 8)).toEqual(seats);
    });
    test('should start with given position and have correct sequence', () => {
      const seats = [
        { position: 7 },
        { position: 8 },
        { position: 0 },
        { position: 3 },
        { position: 5 },
      ];
      const expected = [
        { position: 3 },
        { position: 5 },
        { position: 7 },
        { position: 8 },
        { position: 0 },
      ];
      expect(rotateSeatsToPosition(seats, 3)).toEqual(expected);
    });
  });
  describe('getNextActiveSeatInHand', () => {
    test('skip undefined seats if exist', () => {
      const seats = [
        { position: 2, chipsInPlay: 100, inHand: true },
        null,
        { position: 4, chipsInPlay: 100, inHand: true },
      ];
      expect(getNextActiveSeatInHand(seats, 2).position).toBe(4);
    });
    test("skip seat with status 'sitting out'", () => {
      const seats = [
        { position: 2, chipsInPlay: 100, inHand: true },
        { position: 3, chipsInPlay: 230, sittingOut: true },
        { position: 5, chipsInPlay: 100, inHand: true },
      ];
      expect(getNextActiveSeatInHand(seats, 2).position).toBe(5);
    });
    test('skip seat without chips', () => {
      const seats = [
        { position: 2, chipsInPlay: 100, inHand: true },
        { position: 3, chipsInPlay: 0 },
        { position: 5, chipsInPlay: 100, inHand: true },
        { position: 7, chipsInPlay: 100, inHand: true },
      ];
      expect(getNextActiveSeatInHand(seats, 2).position).toBe(5);
    });
    test('return first possible seat if start index sits on the left', () => {
      const seats = [
        null,
        null,
        { position: 2, chipsInPlay: 100, inHand: true },
        { position: 3, chipsInPlay: 200, inHand: true },
        { position: 4, chipsInPlay: 100, inHand: true },
        { position: 6, chipsInPlay: 100, inHand: true },
      ];
      expect(getNextActiveSeatInHand(seats, 6).position).toBe(2);
    });
  });

  describe('getPreviousActiveSeatInHand', () => {
    test('skip undefined seats if exist', () => {
      const seats = [
        { position: 2, chipsInPlay: 100, inHand: true },
        null,
        { position: 3, chipsInPlay: 100, inHand: true },
        { position: 4, chipsInPlay: 100, inHand: true },
      ];
      expect(getPreviousActiveSeatInHand(seats, 4).position).toBe(3);
    });
    test("skip seat with status 'sitting out'", () => {
      const seats = [
        { position: 2, chipsInPlay: 100, inHand: true },
        { position: 3, chipsInPlay: 230, sittingOut: true },
        { position: 4, chipsInPlay: 230, inHand: true },
        { position: 5, chipsInPlay: 100, inHand: true },
      ];
      expect(getPreviousActiveSeatInHand(seats, 5).position).toBe(4);
    });
    test('skip seat without chips', () => {
      const seats = [
        { position: 2, chipsInPlay: 100, inHand: true },
        { position: 3, chipsInPlay: 0 },
        { position: 5, chipsInPlay: 100, inHand: true },
        { position: 7, chipsInPlay: 100, inHand: true },
      ];
      expect(getPreviousActiveSeatInHand(seats, 7).position).toBe(5);
    });
    test('return first possible seat if start index sits on the right', () => {
      const seats = [
        null,
        null,
        { position: 2, chipsInPlay: 100, inHand: true },
        { position: 3, chipsInPlay: 200, inHand: true },
        { position: 4, chipsInPlay: 100, inHand: true },
      ];
      expect(getPreviousActiveSeatInHand(seats, 2).position).toBe(4);
    });
  });
});
