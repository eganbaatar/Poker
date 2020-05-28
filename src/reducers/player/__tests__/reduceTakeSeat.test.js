const reducer = require('../playersReducer');
const { takeSeat } = require('../../../actions');

describe('takeSeat', () => {
  test('decrement chips and assign seat number', () => {
    const state = {
      byId: {
        1: {
          id: 1,
          name: 'John',
          room: 0,
          chips: 1000,
        },
      },
    };
    const expectedPlayerState = {
      id: 1,
      name: 'John',
      room: 0,
      seat: 4,
      chips: 500,
    };
    const newState = reducer(
      state,
      takeSeat({ tableId: 0, seat: 4, chips: 500, playerId: 1 })
    );
    expect(newState.byId[1]).toEqual(expectedPlayerState);
  });
});
