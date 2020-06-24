const { TestScheduler } = require('jest');
const { calculatePot } = require('../potHelper');

describe('potHelper functions', () => {
  describe('test update pot', () => {
    test('simple case without side pot', () => {
      const table = {
        id: 0,
        pot: {
          current: 0,
        },
        seats: [
          {
            position: 0,
            bet: 200,
            inHand: true,
            chipsInPlay: 200,
          },
          {
            position: 0,
            bet: 50,
            inHand: false,
            chipsInPlay: 120,
          },
          {
            position: 0,
            bet: 200,
            inHand: true,
            chipsInPlay: 50,
          },
        ],
      };
      expect(calculatePot(table)).toEqual({
        current: 450,
      });
    });
    test('one player all in, create main pot', () => {
      const table = {
        id: 0,
        pot: {
          current: 0,
        },
        seats: [
          {
            position: 0,
            bet: 200,
            inHand: true,
            chipsInPlay: 0,
          },
          null,
          {
            position: 2,
            bet: 200,
            inHand: true,
            chipsInPlay: 120,
          },
          {
            position: 3,
            bet: 30,
            inHand: false,
            chipsInPlay: 50,
          },
        ],
      };
      expect(calculatePot(table)).toEqual({
        0: 430,
        current: 0,
      });
    });
    test('multiple player goes all in, create several side pots', () => {
      const table = {
        id: 0,
        pot: {
          current: 50,
        },
        seats: [
          {
            position: 0,
            bet: 200,
            inHand: true,
            chipsInPlay: 0,
          },
          null,
          {
            position: 2,
            bet: 300,
            inHand: true,
            chipsInPlay: 0,
          },
          {
            position: 3,
            bet: 300,
            inHand: true,
            chipsInPlay: 70,
          },
        ],
      };
      expect(calculatePot(table)).toEqual({
        0: 650,
        2: 200,
        current: 0,
      });
    });
    test('all in two successive rounds', () => {
      const table = {
        id: 0,
        pot: {
          0: 240,
          current: 70,
        },
        seats: [
          {
            position: 0,
            bet: 0,
            inHand: true,
            chipsInPlay: 0,
          },
          null,
          {
            position: 2,
            bet: 80,
            inHand: true,
            chipsInPlay: 0,
          },
          {
            position: 3,
            bet: 80,
            inHand: true,
            chipsInPlay: 70,
          },
        ],
      };
      expect(calculatePot(table)).toEqual({
        '0': 240,
        '2': 230,
        current: 0,
      });
    });
    test('all in and normal pot between other players', () => {
      const table = {
        id: 0,
        pot: {
          0: 240,
          current: 70,
        },
        seats: [
          {
            position: 0,
            bet: 0,
            inHand: true,
            chipsInPlay: 0,
          },
          null,
          {
            position: 2,
            bet: 50,
            inHand: true,
            chipsInPlay: 200,
          },
          {
            position: 3,
            bet: 50,
            inHand: true,
            chipsInPlay: 70,
          },
        ],
      };
      expect(calculatePot(table)).toEqual({
        '0': 240,
        current: 170,
      });
    });
  });
});
