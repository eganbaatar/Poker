const deck = require('../../../utils/deck');
const { deal: dealAction } = require('../../../actions');
const reducer = require('../tableReducer');

describe('deal', () => {
  const currentDeck = ['Ah', 'Kd', '10s', 'Js', '7d', '2c', 'Jh', '3c'];
  test('deal cards to players in preFlop phase', () => {
    const state = {
      byId: {
        0: {
          board: [],
          button: 4,
          phase: 'preFlop',
          seats: [
            {
              position: 0,
              chipsInPlay: 100,
            },
            null,
            {
              position: 2,
              chipsInPlay: 0,
            },
            {
              position: 3,
              chipsInPlay: 100,
              sittingOut: true,
            },
            {
              position: 4,
              chipsInPlay: 150,
            },
            {
              position: 7,
              chipsInPlay: 150,
            },
          ],
        },
      },
    };
    jest.spyOn(deck, 'shuffle').mockReturnValue(currentDeck);
    const newState = reducer(state, dealAction({ tableId: 0 }));
    expect(newState).toEqual({
      byId: {
        0: {
          board: [],
          button: 4,
          phase: 'preFlop',
          deck: ['Jh', '3c'],
          dealt: ['Ah', 'Kd', '10s', 'Js', '7d', '2c'],
          seats: [
            {
              position: 0,
              chipsInPlay: 100,
              cards: ['Kd', '7d'],
            },
            null,
            {
              position: 2,
              chipsInPlay: 0,
            },
            {
              position: 3,
              chipsInPlay: 100,
              sittingOut: true,
            },
            {
              position: 4,
              chipsInPlay: 150,
              cards: ['10s', '2c'],
            },
            {
              position: 7,
              chipsInPlay: 150,
              cards: ['Ah', 'Js'],
            },
          ],
        },
      },
    });
  });
  test('deal flop in flop phase', () => {
    const state = {
      byId: {
        0: {
          board: [],
          button: 4,
          phase: 'flop',
          deck: currentDeck,
          dealt: ['7c', 'Qs'],
        },
      },
    };
    const newState = reducer(state, dealAction({ tableId: 0 }));
    // Ah should be burned
    expect(newState.byId[0].board).toEqual(['Kd', '10s', 'Js']);
    expect(newState.byId[0].deck).toEqual(['7d', '2c', 'Jh', '3c']);
    expect(newState.byId[0].dealt).toEqual([
      '7c',
      'Qs',
      'Ah',
      'Kd',
      '10s',
      'Js',
    ]);
  });
  test('deal turn in turn phase', () => {
    const state = {
      byId: {
        0: {
          board: ['Kd', '10s', 'Js'],
          button: 4,
          phase: 'turn',
          deck: ['7d', '2c', 'Jh', '3c'],
          dealt: ['7c', 'Qs', 'Ah', 'Kd', '10s', 'Js'],
        },
      },
    };
    const newState = reducer(state, dealAction({ tableId: 0 }));
    expect(newState).toEqual({
      byId: {
        0: {
          board: ['Kd', '10s', 'Js', '2c'],
          button: 4,
          phase: 'turn',
          deck: ['Jh', '3c'],
          dealt: ['7c', 'Qs', 'Ah', 'Kd', '10s', 'Js', '7d', '2c'],
        },
      },
    });
  });
  test('deal river in river phase', () => {
    const state = {
      byId: {
        0: {
          board: ['Kd', '10s', 'Js', '2c'],
          button: 4,
          phase: 'river',
          deck: ['Jh', '3c'],
          dealt: ['7c', 'Qs', 'Ah', 'Kd', '10s', 'Js', '7d', '2c'],
        },
      },
    };
    const newState = reducer(state, dealAction({ tableId: 0 }));
    expect(newState).toEqual({
      byId: {
        0: {
          board: ['Kd', '10s', 'Js', '2c', '3c'],
          button: 4,
          phase: 'river',
          deck: [],
          dealt: ['7c', 'Qs', 'Ah', 'Kd', '10s', 'Js', '7d', '2c', 'Jh', '3c'],
        },
      },
    });
  });
});
