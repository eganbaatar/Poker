const reducer = require('../playersReducer');
const { register, enterRoom, leaveRoom, takeSeat } = require('../../actions');

describe('Players reducer', () => {
  describe('register', () => {
    test('add player if not already exists', () => {
      const state = {
        byId: {},
      };
      const newState = reducer(
        state,
        register({ id: 2, name: 'John', chips: 1000 })
      );
      expect(newState.byId[2]).toEqual({
        id: 2,
        name: 'John',
        chips: 1000,
        seat: -1,
      });
    });
  });
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
});
