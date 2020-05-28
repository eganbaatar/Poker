const reducer = require('../playersReducer');
const { register } = require('../../../actions');

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
