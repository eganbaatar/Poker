const { getPublicTableData } = require('../wrapper');

describe('getPublicTableData', () => {
  test('expose public seat infos', () => {
    const table = {
      seatsCount: 6,
      seats: [
        {
          id: '1',
          bet: 0,
          position: 0,
          inHand: false,
          isAllIn: false,
          sittingIn: true,
          cards: [],
          chipsInPlay: 500,
        },
        {
          id: '2',
          bet: 30,
          position: 3,
          inHand: true,
          isAllIn: false,
          sittingIn: true,
          cards: ['As', '5h'],
          chipsInPlay: 700,
        },
      ],
    };
    const publicData = getPublicTableData(table);
    expect(publicData.seats).toEqual([
      {
        bet: 0,
        cards: [],
        chipsInPlay: 500,
        hasCards: false,
        inHand: false,
        name: undefined,
        sittingIn: true,
      },
      null,
      null,
      {
        bet: 30,
        cards: [],
        chipsInPlay: 700,
        hasCards: true,
        inHand: true,
        name: undefined,
        sittingIn: true,
      },
      null,
      null,
    ]);
  });
});
