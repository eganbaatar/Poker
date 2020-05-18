const {
  allTablesById,
  allTablesByArray,
  getTableById,
  getActiveSeats,
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
  test('return active seats of table', () => {
    const state = {
      byId: {
        0: {
          id: 0,
          seats: [
            {
              playerId: 1,
              inHand: true,
            },
            {
              playerId: 2,
              inHand: false,
              sittingOut: true,
            },
            {
              playerId: 3,
              inHand: false,
            },
            {
              playerId: 4,
              inHand: false,
              sittingOut: true,
            },
          ],
        },
      },
    };
    expect(getActiveSeats(state)(0)()).toEqual(state.byId[1]);
  });
});
