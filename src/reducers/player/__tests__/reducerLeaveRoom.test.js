const reducer = require('../playersReducer');
const { leaveRoom } = require('../../../actions');

describe('leave room', () => {
  test('leave table if not sittng on table', () => {
    const state = {
      byId: {
        0: {
          name: 'John',
          room: 1,
          seat: 3,
        },
      },
    };
    const newState = reducer(state, leaveRoom({ tableId: 1, playerId: 1 }));
    expect(newState).toEqual(state);
  });

  test('leave room', () => {
    const state = {
      byId: {
        1: { name: 'John', room: 1 },
      },
    };
    const newState = reducer(state, leaveRoom({ tableId: 1, playerId: 1 }));
    expect(newState.byId[1].room).toBe(null);
  });
});
