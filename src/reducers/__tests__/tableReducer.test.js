const { clone, cloneDeep } = require('lodash');
const deck = require('../../utils/deck');
const {
  takeSeat,
  startRound,
  postBlind,
  deal: dealAction,
} = require('../../actions');
const { getTableById } = require('../../selectors/tableSelector');
const reducer = require('../tableReducer');

describe('table reducer', () => {
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
            deck: deck.shuffle(),
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

  describe('postSmallBlind', () => {
    const seats = [];
    seats[2] = {
      position: 2,
      bet: 0,
      chipsInPlay: 100,
      isAllIn: false,
    };
    seats[3] = {
      position: 3,
      bet: 0,
      chipsInPlay: 50,
      isAllIn: false,
    };
    const state = {
      byId: {
        0: {
          phase: 'smallBlind',
          toAct: 3,
          smallBlind: 5,
          bigBlind: 10,
          seats,
        },
      },
    };
    test('small blind updates current bet and chipsInPlay', () => {
      const newState = reducer(
        state,
        postBlind({ tableId: 0, isSmallBlind: true })
      );
      const table = getTableById(newState)(0);
      expect(table.seats[3]).toEqual({
        position: 3,
        bet: 5,
        chipsInPlay: 45,
        isAllIn: false,
      });
    });
    test('change game phase/biggestBet and pass action to next player', () => {
      const newState = reducer(
        state,
        postBlind({ tableId: 0, isSmallBlind: true })
      );
      const table = getTableById(newState)(0);
      expect(table.phase).toEqual('bigBlind');
      expect(table.toAct).toEqual(2);
      expect(table.biggestBet).toEqual(5);
    });
    test('small blind has not enough chipsInPlay', () => {
      const state = {
        byId: {
          0: {
            toAct: 1,
            seats: [
              {
                position: 0,
                chipsInPlay: 100,
                isAllIn: false,
              },
              {
                position: 1,
                chipsInPlay: 3,
                isAllIn: false,
              },
            ],
          },
        },
      };
      const newState = reducer(
        state,
        postBlind({ tableId: 0, isSmallBlind: true })
      );
      const table = getTableById(newState)(0);
      expect(table.seats[1]).toEqual({
        position: 1,
        bet: 3,
        chipsInPlay: 0,
        isAllIn: true,
      });
    });
  });

  describe('postBigBlind', () => {
    const seats = [];
    seats[2] = {
      position: 2,
      bet: 0,
      chipsInPlay: 100,
      isAllIn: false,
    };
    seats[3] = {
      position: 3,
      bet: 0,
      chipsInPlay: 50,
      isAllIn: false,
    };
    const state = {
      byId: {
        0: {
          phase: 'bigBlind',
          toAct: 3,
          smallBlind: 5,
          bigBlind: 10,
          seats,
        },
      },
    };
    test('big blind updates current bet and chipsInPlay', () => {
      const newState = reducer(
        state,
        postBlind({ tableId: 0, isSmallBlind: false })
      );
      const table = getTableById(newState)(0);
      expect(table.seats[3]).toEqual({
        position: 3,
        bet: 10,
        chipsInPlay: 40,
        isAllIn: false,
      });
    });
    test('updates game info and pass action to next player', () => {
      const newState = reducer(
        state,
        postBlind({ tableId: 0, isSmallBlind: false })
      );
      const table = getTableById(newState)(0);
      expect(table.phase).toEqual('preFlop');
      expect(table.toAct).toEqual(2);
      expect(table.biggestBet).toEqual(10);
      expect(table.lastPlayerToAct).toEqual(3);
    });
    test('small blind has not enough chipsInPlay', () => {
      const state = {
        byId: {
          0: {
            toAct: 1,
            seats: [
              {
                position: 0,
                chipsInPlay: 100,
                isAllIn: false,
              },
              {
                position: 1,
                chipsInPlay: 9,
                isAllIn: false,
              },
            ],
          },
        },
      };
      const newState = reducer(
        state,
        postBlind({ tableId: 0, isSmallBlind: false })
      );
      const table = getTableById(newState)(0);
      expect(table.seats[1]).toEqual({
        position: 1,
        bet: 9,
        chipsInPlay: 0,
        isAllIn: true,
      });
    });
  });

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
    test('deal flop in flop phase', () => {});
    test('deal turn in turn phase', () => {});
    test('deal river in river phase', () => {});
  });
});
