const { clone, cloneDeep } = require('lodash');
const { shuffle } = require('../../utils/deck');
const { takeSeat, startRound } = require('../../actions');
const { getTableById } = require('../../selectors/tableSelector');
const reducer = require('../tableReducer');

describe.only('table reducer', () => {
  describe('takeSeat', () => {
    test('assign player to seat and increase activeSeatCount', () => {
      const state = {
        byId: {
          0: {
            seats: ['socket-1', 'socket-12'],
            activeSeatsCount: 2,
          },
        },
      };
      const newState = reducer(
        state,
        takeSeat({ playerId: 'socket-4', tableId: 0, seat: 4, chips: 500 })
      );
      expect(newState.byId[0].seats[4]).toEqual('socket-4');
      expect(newState.byId[0].activeSeatsCount).toEqual(3);
    });
  });

  describe('startRound', () => {
    let state;
    beforeEach(() => {
      state = {
        byId: {
          0: {
            id: 0,
            gameOn: false,
            seatCount: 5,
            activeSeatsCount: 5,
            seats: [
              {
                position: 0,
                playerId: '0',
                chipsInPlay: 480,
                inHand: true,
                isAllIn: false,
                cards: ['Ac', '2h'],
                bet: 30,
              },
              {
                position: 1,
                playerId: '1',
                chipsInPlay: 0,
                inHand: true,
                isAllIn: true,
                cards: ['5c', '9h'],
                bet: 120,
              },
              {
                position: 2,
                playerId: '2',
                chipsInPlay: 200,
                inHand: true,
                isAllIn: false,
                cards: ['Ks', '2c'],
                bet: 70,
              },
              {
                position: 3,
                playerId: '3',
                chipsInPlay: 600,
                inHand: true,
                isAllIn: false,
                cards: ['Qc', '10h'],
                bet: 30,
              },
              {
                position: 4,
                playerId: '4',
                chipsInPlay: 0,
                inHand: true,
                isAllIn: true,
                cards: ['Jc', 'Jh'],
                bet: 30,
              },
            ],
            board: ['4c', '3d', 'Kd', '9c', '2h'],
            deck: shuffle(),
          },
        },
      };
    });
    test('reset game infos', () => {
      const newState = reducer(state, startRound({ tableId: 0 }));
      const table = getTableById(newState)(0);

      expect(table).toEqual(
        expect.objectContaining({
          id: 0,
          seatCount: 5,
          gameOn: true,
          activeSeatsCount: 3,
          board: [],
        })
      );
      expect(table.deck).not.toEqual(state.deck);
    });
    test('reset seat infos', () => {
      const newState = reducer(state, startRound({ tableId: 0 }));
      const table = getTableById(newState)(0);

      expect(table.seats.length).toBe(5);
      table.seats.forEach((seat) => {
        expect(seat).toEqual(
          expect.objectContaining({
            isAllIn: false,
            cards: [],
            bet: 0,
          })
        );
      });
    });
    test('sit out players without chips', () => {
      const newState = reducer(state, startRound({ tableId: 0 }));
      const table = getTableById(newState)(0);

      expect(table.seats).toEqual([
        {
          playerId: '0',
          position: 0,
          chipsInPlay: 480,
          inHand: true,
          isAllIn: false,
          cards: [],
          bet: 0,
          sittingOut: false,
        },
        {
          position: 1,
          playerId: '1',
          chipsInPlay: 0,
          inHand: false,
          isAllIn: false,
          cards: [],
          bet: 0,
          sittingOut: true,
        },
        {
          position: 2,
          playerId: '2',
          chipsInPlay: 200,
          inHand: true,
          isAllIn: false,
          cards: [],
          bet: 0,
          sittingOut: false,
        },
        {
          position: 3,
          playerId: '3',
          chipsInPlay: 600,
          inHand: true,
          isAllIn: false,
          cards: [],
          bet: 0,
          sittingOut: false,
        },
        {
          position: 4,
          playerId: '4',
          chipsInPlay: 0,
          inHand: false,
          isAllIn: false,
          cards: [],
          bet: 0,
          sittingOut: true,
        },
      ]);
    });
    test('do not sit in player which was sitting out with chips', () => {
      const _state = cloneDeep(state);
      _state.byId[0].seats[2].sittingOut = true;
      _state.byId[0].seats[2].inHand = false;
      const newState = reducer(_state, startRound({ tableId: 0 }));
      const table = getTableById(newState)(0);
      expect(table.seats[2].sittingOut).toBe(true);
    });
    test('give dealer button to random player if not given', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.72);
      const newState = reducer(state, startRound({ tableId: 0 }));
      const table = getTableById(newState)(0);
      expect(table.button).toBe(3);
    });
    test('pass button to next player if player is active', () => {
      const _state = clone(state);
      _state.byId[0].button = 2;
      const newState = reducer(_state, startRound({ tableId: 0 }));
      const table = getTableById(newState)(0);
      expect(table.button).toBe(3);
    });
    test('skip next player(s) if sitting out', () => {
      const _state = clone(state);
      _state.byId[0].button = 0;
      const newState = reducer(_state, startRound({ tableId: 0 }));
      const table = getTableById(newState)(0);
      expect(table.button).toBe(2);
    });
    describe('pass action to small blind', () => {
      test('if heads up then dealer posts small bind', () => {
        const state = {
          byId: {
            0: {
              seats: [
                {
                  position: 0,
                  playerId: '3',
                  chipsInPlay: 600,
                  inHand: false,
                  isAllIn: false,
                  cards: ['Ac, Jd'],
                  bet: 10,
                },
                {
                  position: 1,
                  playerId: '5',
                  chipsInPlay: 600,
                  inHand: false,
                  isAllIn: false,
                  cards: ['Ks, J8'],
                  bet: 20,
                },
              ],
              button: 1,
              toAct: 1,
            },
          },
        };
        const newState = reducer(state, startRound({ tableId: 0 }));
        const table = getTableById(newState)(0);
        expect(table.button).toBe(0);
        expect(table.toAct).toBe(0);
        expect(table.phase).toBe('smallBlind');
      });
      test('pass action to small blind', () => {
        const _state = clone(state);
        _state.byId[0].button = 2;
        const newState = reducer(_state, startRound({ tableId: 0 }));
        const table = getTableById(newState)(0);
        expect(table.button).toBe(3);
        expect(table.toAct).toBe(0);
        expect(table.phase).toBe('smallBlind');
      });
    });
  });
});
