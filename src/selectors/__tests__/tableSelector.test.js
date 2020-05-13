const {
  allTablesById,
  allTablesByArray,
  getTableById,
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
  describe('getTableById', () => {
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
  });
});
