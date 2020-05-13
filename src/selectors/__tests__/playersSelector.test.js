const {
  allPlayersById,
  allPlayersByArray,
  getPlayerById,
  getPlayerByName,
} = require('../../selectors/playersSelector');

describe('playersSelector', () => {
  describe('all players selector', () => {
    const state = {
      byId: {
        0: {
          name: 'John',
        },
        1: {
          name: 'Max',
        },
      },
    };
    test('return all players as map', () => {
      expect(allPlayersById(state)).toEqual(state.byId);
    });

    test('return all players as array', () => {
      expect(allPlayersByArray(state)).toEqual([
        { name: 'John' },
        { name: 'Max' },
      ]);
    });
  });
  describe('getPlayerById', () => {
    test('return player by id', () => {
      const state = {
        byId: {
          0: {
            name: 'John',
          },
          1: {
            name: 'Max',
          },
        },
      };
      expect(getPlayerById(state)(1)).toEqual(state.byId[1]);
    });
  });
  describe('getPlayerByName', () => {
    test('return player by name', () => {
      const state = {
        byId: {
          0: {
            name: 'John',
          },
          1: {
            name: 'Max',
          },
        },
      };
      expect(getPlayerByName(state)('Max')).toEqual(state.byId[1]);
    });
  });
});
