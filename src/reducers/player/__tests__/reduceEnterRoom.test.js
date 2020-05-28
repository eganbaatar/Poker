const reducer = require('../playersReducer');
const { enterRoom } = require('../../../actions');

describe('enter room', () => {
  test('not throw error if player not found', () => {
    const state = {
      byId: {},
    };
    const newState = reducer(state, enterRoom({ tableId: 1, playerId: 1 }));
    expect(newState.byId).toEqual({});
  });

  test('enterRoom', () => {
    const state = {
      byId: {
        1: { name: 'John' },
      },
    };
    const newState = reducer(state, enterRoom({ tableId: 1, playerId: 1 }));
    expect(newState.byId[1].room).toBe(1);
  });
});
