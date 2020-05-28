const { postBlind } = require('../../../actions');
const { getTableById } = require('../../../selectors/tableSelector');
const reducer = require('../tableReducer');

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
