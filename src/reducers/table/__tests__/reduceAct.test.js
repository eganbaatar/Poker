const { find } = require('lodash');
const { act } = require('../../../actions');
const { getTableById } = require('../../../selectors/tableSelector');
const reducer = require('../tableReducer');

describe('test players actions in sequence', () => {
  const state = {
    byId: {
      0: {
        button: 3,
        gameOn: true,
        lastPlayerToAct: 5,
        toAct: 5,
        seats: [
          {
            position: 0,
            chipsInPlay: 150,
            inHand: true,
            bet: 0,
          },
          {
            position: 2,
            chipsInPlay: 350,
            inHand: true,
            bet: 0,
          },
          {
            position: 3,
            chipsInPlay: 100,
            inHand: true,
            bet: 0,
          },
          {
            position: 4,
            chipsInPlay: 50,
            inHand: true,
            bet: 5,
          },
          {
            position: 5,
            chipsInPlay: 550,
            inHand: true,
            bet: 10,
          },
          {
            position: 6,
            chipsInPlay: 255,
            inHand: true,
            bet: 0,
          },
        ],
      },
    },
  };
  test('seat 6 checks', () => {
    let tmpState = reducer(
      state,
      act({
        tableId: 0,
        seat: 6,
        type: 'CHECK',
      })
    );
    const table = tmpState.byId[0];
    const seat = find(table.seats, { position: 6 });
    expect(seat.chipsInPlay).toEqual(255);
    expect(seat.bet).toBe(0);
    expect(table.toAct).toEqual(0);
    expect(table.lastPlayerToAct).toEqual(5);
  });
  test('seat 0 bets', () => {
    let tmpState = reducer(
      state,
      act({
        tableId: 0,
        seat: 6,
        type: 'CHECK',
      })
    );
    tmpState = reducer(
      tmpState,
      act({
        tableId: 0,
        seat: 0,
        amount: 30,
        type: 'BET',
      })
    );
    const table = tmpState.byId[0];
    const seat = find(table.seats, { position: 0 });
    expect(seat.chipsInPlay).toEqual(120);
    expect(seat.bet).toBe(30);
    expect(table.toAct).toEqual(2);
    expect(table.lastPlayerToAct).toEqual(6);
  });

  test('seat 2 folds', () => {
    let tmpState = reducer(
      state,
      act({
        tableId: 0,
        seat: 6,
        type: 'CHECK',
      })
    );
    tmpState = reducer(
      tmpState,
      act({
        tableId: 0,
        seat: 0,
        amount: 30,
        type: 'BET',
      })
    );
    tmpState = reducer(
      tmpState,
      act({
        tableId: 0,
        seat: 2,
        type: 'FOLD',
      })
    );
    const table = tmpState.byId[0];
    const seat = find(table.seats, { position: 2 });

    expect(seat.chipsInPlay).toEqual(350);
    expect(seat.bet).toBe(0);
    expect(table.toAct).toEqual(3);
    expect(table.lastPlayerToAct).toEqual(6);
  });

  test('seat 3 calls', () => {
    let tmpState = reducer(
      state,
      act({
        tableId: 0,
        seat: 6,
        type: 'CHECK',
      })
    );
    tmpState = reducer(
      tmpState,
      act({
        tableId: 0,
        seat: 0,
        amount: 30,
        type: 'BET',
      })
    );
    tmpState = reducer(
      tmpState,
      act({
        tableId: 0,
        seat: 2,
        type: 'FOLD',
      })
    );
    tmpState = reducer(
      tmpState,
      act({
        tableId: 0,
        seat: 3,
        type: 'CALL',
        amount: 30,
      })
    );
    const table = tmpState.byId[0];
    const seat = find(table.seats, { position: 3 });
    expect(seat.chipsInPlay).toEqual(70);
    expect(seat.bet).toBe(30);
    expect(table.toAct).toEqual(4);
    expect(table.lastPlayerToAct).toEqual(6);
  });

  test('seat 4 raises', () => {
    let tmpState = reducer(
      state,
      act({
        tableId: 0,
        seat: 6,
        type: 'CHECK',
      })
    );
    tmpState = reducer(
      tmpState,
      act({
        tableId: 0,
        seat: 0,
        amount: 30,
        type: 'BET',
      })
    );
    tmpState = reducer(
      tmpState,
      act({
        tableId: 0,
        seat: 2,
        type: 'FOLD',
      })
    );
    tmpState = reducer(
      tmpState,
      act({
        tableId: 0,
        seat: 3,
        type: 'CALL',
      })
    );
    tmpState = reducer(
      tmpState,
      act({
        tableId: 0,
        seat: 4,
        type: 'RAISE',
        amount: 50,
      })
    );
    const table = tmpState.byId[0];
    const seat = find(table.seats, { position: 4 });
    expect(seat.chipsInPlay).toEqual(0);
    expect(seat.bet).toBe(55);
    expect(table.toAct).toEqual(5);
    expect(table.lastPlayerToAct).toEqual(3);
  });
});
