const {
  getPublicTableData,
  getLastRaise,
  getBiggestBet,
} = require('../wrapper');

describe('wrapper', () => {
  test('getPublicTableData', () => {
    const table = {
      seatsCount: 6,
      seats: [
        {
          playerId: '1',
          bet: 0,
          position: 0,
          inHand: false,
          isAllIn: false,
          sittingOut: false,
          cards: [],
          chipsInPlay: 500,
        },
        {
          playerId: '2',
          bet: 30,
          position: 3,
          inHand: true,
          isAllIn: false,
          sittingOut: false,
          cards: ['As', '5h'],
          chipsInPlay: 700,
        },
      ],
    };
    const players = [
      {
        id: '1',
        name: 'John',
      },
      {
        id: '2',
        name: 'Max',
      },
    ];
    const publicData = getPublicTableData(table, players);
    expect(publicData.seats).toEqual([
      {
        bet: 0,
        cards: [],
        chipsInPlay: 500,
        hasCards: false,
        inHand: false,
        name: undefined,
        sittingIn: true,
        name: 'John',
      },
      null,
      null,
      {
        bet: 30,
        cards: [],
        chipsInPlay: 700,
        hasCards: true,
        inHand: true,
        name: 'Max',
        sittingIn: true,
      },
      null,
      null,
    ]);
  });
  test('getLastRaise', () => {
    const table = {
      seats: [
        null,
        { bet: 5 },
        { bet: 10 },
        null,
        {
          bet: 15,
        },
        {
          bet: 35,
        },
      ],
    };
    expect(getLastRaise(table)).toBe(20);
  });
  test('getBiggestBet', () => {
    const table = {
      seats: [
        null,
        { bet: 5 },
        { bet: 10 },
        null,
        {
          bet: 15,
        },
        {
          bet: 35,
        },
      ],
    };
    expect(getBiggestBet(table)).toBe(35);
  });
});