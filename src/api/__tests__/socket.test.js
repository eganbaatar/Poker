const store = require('../../models/store');
const socket = require('../socket');
const { takeSeat, startRound } = require('../../actions');
const { getDefaultSeatObject } = require('../../selectors/tableSelector');

describe('socket', () => {
  let mockCallback;
  beforeAll(() => {
    mockCallback = jest.fn();
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('handleSitOnTable', () => {
    let spyDispatch;
    let stateSpy;
    beforeEach(() => {
      spyDispatch = jest.spyOn(store, 'dispatch');
      spyDispatch.mockImplementation(jest.fn());
      stateSpy = jest.spyOn(store, 'getState');
      stateSpy.mockReturnValue({
        tables: {
          byId: {
            0: {
              id: 0,
              seats: [
                {
                  ...getDefaultSeatObject(),
                  position: 1,
                },
                {
                  ...getDefaultSeatObject(),
                  position: 2,
                },
                {
                  ...getDefaultSeatObject(),
                  position: 3,
                },
                {
                  ...getDefaultSeatObject(),
                  position: 4,
                },
              ],
              seatCount: 10,
              maxBuyIn: 1000,
              minBuyIn: 500,
              gameOn: true,
            },

            2: {
              id: 2,
              seats: [],
              seatCount: 6,
              activeSeatsCount: 0,
              maxBuyIn: 1000,
              minBuyIn: 200,
            },
          },
        },
        players: {
          byId: {
            1: {
              id: 1,
              room: 3,
            },
            2: {
              id: 2,
              room: 0,
              chips: 1000,
              seat: 1,
            },
            3: {
              id: 3,
              room: 0,
              chips: 100,
            },
            4: {
              id: 4,
              room: 0,
              chips: 10000,
            },
            5: {
              id: 5,
              room: 1,
              chips: 5000,
            },
          },
        },
      });
    });
    test('error callback on missing seat number format', () => {
      socket.handleSitOnTheTable({ tableId: 0, chips: 500 }, mockCallback, {
        id: 2,
      });
      expect(mockCallback).toHaveBeenCalledWith({
        success: false,
        error: 'invalid data',
      });
      expect(spyDispatch).not.toHaveBeenCalled();
    });
    test('error callback on missing table number', () => {
      socket.handleSitOnTheTable({ seat: 7, chips: 500 }, mockCallback, {
        id: 2,
      });
      expect(mockCallback).toHaveBeenCalledWith({
        success: false,
        error: 'invalid data',
      });
      expect(spyDispatch).not.toHaveBeenCalled();
    });
    test('error callback on non existing table number', () => {
      socket.handleSitOnTheTable(
        { seat: 7, chips: 500, tableId: 2 },
        mockCallback,
        {
          id: 2,
        }
      );
      expect(mockCallback).toHaveBeenCalledWith({
        success: false,
        error: 'invalid data',
      });
      expect(spyDispatch).not.toHaveBeenCalled();
    });
    test('error callback on missing chips', () => {
      socket.handleSitOnTheTable({ seat: 7, tableId: 0 }, mockCallback, {
        id: 2,
      });
      expect(mockCallback).toHaveBeenCalledWith({
        success: false,
        error: 'invalid data',
      });
      expect(spyDispatch).not.toHaveBeenCalled();
    });
    test('error callback on invalid seat number', () => {
      socket.handleSitOnTheTable(
        { seat: -1, tableId: 0, chips: 1000 },
        mockCallback,
        {
          id: 1,
        }
      );
      expect(mockCallback).toHaveBeenCalledWith({
        success: false,
        error: 'invalid data',
      });
      socket.handleSitOnTheTable(
        { seat: 'a', tableId: 0, chips: 1000 },
        mockCallback,
        {
          id: 1,
        }
      );
      expect(mockCallback).toHaveBeenCalledWith({
        success: false,
        error: 'invalid data',
      });
      socket.handleSitOnTheTable(
        { seat: 10, tableId: 0, chips: 1000 },
        mockCallback,
        {
          id: 1,
        }
      );
      expect(mockCallback).toHaveBeenCalledWith({
        success: false,
        error: 'invalid data',
      });
      expect(spyDispatch).not.toHaveBeenCalled();
    });
    test('error callback on invalid chips format', () => {
      socket.handleSitOnTheTable(
        { seat: 7, tableId: 0, chips: -1 },
        mockCallback,
        {
          id: 1,
        }
      );
      expect(mockCallback).toHaveBeenCalledWith({
        success: false,
        error: 'invalid data',
      });
      socket.handleSitOnTheTable(
        { seat: 7, tableId: 0, chips: 'a' },
        mockCallback,
        {
          id: 1,
        }
      );
      expect(mockCallback).toHaveBeenCalledWith({
        success: false,
        error: 'invalid data',
      });
      socket.handleSitOnTheTable(
        { seat: 7, tableId: 0, chips: 10.5 },
        mockCallback,
        {
          id: 1,
        }
      );
      expect(mockCallback).toHaveBeenCalledWith({
        success: false,
        error: 'invalid data',
      });
      expect(spyDispatch).not.toHaveBeenCalled();
    });
    test('error callback if seat is not empty', () => {
      socket.handleSitOnTheTable(
        { seat: 2, tableId: 0, chips: 100 },
        mockCallback,
        {
          id: 7,
        }
      );
      expect(mockCallback).toHaveBeenCalledWith({
        success: false,
        error: 'invalid data',
      });
    });
    test('error callback if player already sitting on the table', () => {
      socket.handleSitOnTheTable(
        { seat: 5, tableId: 0, chips: 100 },
        mockCallback,
        {
          id: 2,
        }
      );
      expect(mockCallback).toHaveBeenCalledWith({
        success: false,
        error: 'invalid data',
      });
    });
    test('error callback if player is not in the room', () => {
      socket.handleSitOnTheTable(
        { seat: 2, tableId: 0, chips: 100 },
        mockCallback,
        {
          id: 2,
        }
      );
      expect(mockCallback).toHaveBeenCalledWith({
        success: false,
        error: 'invalid data',
      });
    });
    test('error callback if player has insufficient chips', () => {
      socket.handleSitOnTheTable(
        { seat: 5, tableId: 0, chips: 1000 },
        mockCallback,
        {
          id: 3,
        }
      );
      expect(mockCallback).toHaveBeenCalledWith({
        success: false,
        error: 'Not enough chips',
      });
    });
    test('error callback if chips not in table range', () => {
      socket.handleSitOnTheTable(
        { seat: 5, tableId: 0, chips: 2000 },
        mockCallback,
        {
          id: 4,
        }
      );
      expect(mockCallback).toHaveBeenCalledWith({
        success: false,
        error:
          'The amount of chips should be between the maximum and the minimum amount of allowed buy in',
      });

      socket.handleSitOnTheTable(
        { seat: 5, tableId: 0, chips: 400 },
        mockCallback,
        {
          id: 4,
        }
      );
      expect(mockCallback).toHaveBeenCalledWith({
        success: false,
        error:
          'The amount of chips should be between the maximum and the minimum amount of allowed buy in',
      });
    });
    test.skip('success', () => {
      const mockEmit = jest.fn((arg) => {});
      const mockIo = {
        sockets: {
          in: (room) => ({ emit: mockEmit }),
        },
      };
      const mockSocket = {
        id: 4,
      };
      socket.handleSitOnTheTable(
        { playerId: '1a', seat: 5, tableId: 0, chips: 600 },
        mockCallback,
        mockSocket,
        mockIo
      );
      expect(spyDispatch).toHaveBeenCalledWith(
        takeSeat({ playerId: 4, tableId: 0, chips: 600, seat: 5 })
      );
      expect(spyDispatch).not.toHaveBeenCalledWith(startRound({ tableId: 0 }));
      expect(mockCallback).toHaveBeenCalledWith({
        success: true,
      });
      expect(mockEmit).toHaveBeenCalled();
    });

    test.skip('start new round if nessessary', () => {
      const mockEmit = jest.fn((arg) => {});

      const mockIo = {
        sockets: {
          in: () => ({ emit: mockEmit }),
        },
      };
      const mockSocket = {
        id: 5,
      };
      stateSpy.mockReturnValue({
        tables: {
          byId: {
            1: {
              id: 1,
              seats: [
                {
                  ...getDefaultSeatObject(),
                  position: 1,
                },
              ],
              seatCount: 6,
              activeSeatsCount: 2,
              maxBuyIn: 1000,
              minBuyIn: 200,
            },
          },
        },
        players: {
          byId: {
            5: {
              id: 5,
              room: 1,
              chips: 5000,
            },
          },
        },
      });
      socket.handleSitOnTheTable(
        { seat: 1, tableId: 1, chips: 600 },
        mockCallback,
        mockSocket,
        mockIo
      );
      expect(spyDispatch).toHaveBeenNthCalledWith(
        1,
        takeSeat({ playerId: 5, tableId: 1, chips: 600, seat: 1 })
      );
      expect(spyDispatch).toHaveBeenNthCalledWith(
        2,
        startRound({ tableId: 1 })
      );
      expect(mockCallback).toHaveBeenCalledWith({
        success: true,
      });
      expect(mockEmit).toHaveBeenCalled();
    });
    test('do not start new round if only one player present', () => {
      const mockEmit = jest.fn((arg) => {});
      const broadcast = {
        to: (arg) => {
          return {
            emit: mockEmit,
          };
        },
      };
      const mockSocket = {
        id: 5,
        broadcast,
      };
      socket.handleSitOnTheTable(
        { seat: 4, tableId: 2, chips: 600 },
        mockCallback,
        mockSocket
      );
      expect(spyDispatch).not.toHaveBeenCalledWith(startRound({ tableId: 2 }));
    });
  });

  describe('handlePostBlind', () => {
    beforeEach(() => {
      jest.spyOn(store, 'getState').mockReturnValue({
        tables: {
          byId: {
            0: {
              id: 0,
              seats: [1, 2, 3, 4],
              seatCount: 10,
              maxBuyIn: 1000,
              minBuyIn: 500,
            },
          },
        },
        players: {
          byId: {
            1: {
              id: 1,
              room: 3,
            },
            2: {
              id: 2,
              room: 0,
              chips: 1000,
              seat: 1,
            },
            3: {
              id: 3,
              room: 0,
              chips: 100,
            },
          },
        },
      });
    });
    test('do nothing if player is not on table', () => {});
    test('do nothing if not in blind phase', () => {});
    test('do nothing if post blind comes not from acting player', () => {});
    test('post small blind', () => {});
    test('post big blind', () => {});
  });
});
