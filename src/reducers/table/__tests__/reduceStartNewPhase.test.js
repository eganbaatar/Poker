const { startNewPhase } = require('../../../actions');
const { getTableById } = require('../../../selectors/tableSelector');
const reducer = require('../tableReducer');

describe('startNewPhase', () => {
  test('to match snapshot', () => {
    const state = {
      byId: {
        0: {
          id: 0,
          gameOn: true,
          seatCount: 5,
          activeSeatsCount: 5,
          button: 1,
          phase: 'flop',
          seats: [
            {
              position: 0,
              playerId: '0',
              chipsInPlay: 480,
              inHand: true,
              isAllIn: false,
              cards: ['Ac', '2h'],
              bet: 120,
            },
            {
              position: 1,
              playerId: '1',
              chipsInPlay: 0,
              inHand: true,
              isAllIn: true,
              cards: ['5c', '9h'],
              bet: 80,
            },
            {
              position: 2,
              playerId: '2',
              chipsInPlay: 200,
              inHand: false,
              isAllIn: false,
              cards: ['Ks', '2c'],
              bet: 70,
            },
            {
              position: 3,
              playerId: '3',
              chipsInPlay: 0,
              inHand: true,
              isAllIn: true,
              cards: ['Qc', '10h'],
              bet: 120,
            },
            {
              position: 4,
              playerId: '4',
              chipsInPlay: 210,
              inHand: true,
              isAllIn: false,
              cards: ['Jc', 'Jh'],
              bet: 120,
            },
          ],
          board: ['4c', '3d', 'Kd'],
        },
      },
    };
    const newState = reducer(state, startNewPhase({ tableId: 0 }));
    const table = getTableById(newState)(0);
    expect(table).toMatchSnapshot();
  });
});
