const socketCtrl = require('../socket');
const store = require('../../models/store');
const deck = require('../../utils/deck');

describe('basic test with 2 players', () => {
  let mockSocket;
  let mockCallback;
  let mockIO;
  let mockEmit;
  beforeAll(() => {
    mockEmit = jest.fn();
    mockIO = {
      to: jest.fn(() => ({ emit: mockEmit })),
      sockets: {
        on: jest.fn(),
        in: jest.fn(() => ({
          emit: mockEmit,
        })),
      },
    };
    mockSockets = [
      {
        id: 'sid_player1',
        join: jest.fn(),
      },
      {
        id: 'sid_player2',
        join: jest.fn(),
      },
    ];
    mockCallback = jest.fn();
    jest
      .spyOn(deck, 'shuffle')
      .mockImplementation(() => [
        '7d',
        '9c',
        '2h',
        'Ts',
        'Js',
        '3c',
        '4s',
        '8s',
        'Qs',
        '9s',
        '5c',
        'Ad',
        '9d',
        'Jc',
        'Kh',
        '5h',
        'Tc',
        'Qc',
        'Qd',
        'Ac',
        '5s',
        '9h',
        'As',
        '7c',
        'Ks',
        '3d',
        'Jh',
        '4d',
        'Qh',
        '8h',
        '6s',
        '2d',
        '6h',
        '6d',
        '6c',
        'Td',
        '7h',
        'Th',
        '8d',
        '3s',
        '3h',
        'Kc',
        '2s',
        '7s',
        '4c',
        'Jd',
        '8c',
        '2c',
        'Ah',
        'Kd',
        '5d',
        '4h',
      ]);

    socketCtrl.init(mockIO);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  afterAll(() => {});

  test('register Player 1', () => {
    const socket = mockSockets[0];
    socketCtrl.handleRegister('Player 1', socket, mockCallback);
    expect(mockCallback).toHaveBeenCalledWith({
      success: true,
      screenName: 'Player 1',
      totalChips: 10000,
    });
    expect(store.getState()).toMatchSnapshot();
  });

  test('register Player 2', () => {
    const socket = mockSockets[1];
    socketCtrl.handleRegister('Player 2', socket, mockCallback);
    expect(mockCallback).toHaveBeenCalledWith({
      success: true,
      screenName: 'Player 2',
      totalChips: 10000,
    });
    expect(store.getState()).toMatchSnapshot();
  });

  test('player 1 enters room', () => {
    const socket = mockSockets[0];
    socketCtrl.handleEnterRoom(0, socket);
    expect(socket.join).toHaveBeenCalledWith(`table-0`);
    expect(store.getState()).toMatchSnapshot();
  });

  test('player 2 enters room', () => {
    const socket = mockSockets[1];
    socketCtrl.handleEnterRoom(0, socket);
    expect(socket.join).toHaveBeenCalledWith(`table-0`);
    expect(store.getState()).toMatchSnapshot();
  });

  test('player 1 takes seat on 3', () => {
    const socket = mockSockets[0];
    socketCtrl.handleSitOnTheTable(
      {
        seat: 3,
        tableId: 0,
        chips: 500,
      },
      mockCallback,
      socket
    );
    expect(mockCallback).toHaveBeenCalledWith({ success: true });
    expect(mockIO.sockets.in).toHaveBeenCalledWith('table-0');
    expect(store.getState().tables.byId[0]).toMatchSnapshot();
  });

  test('player 2 takes seat on 5', () => {
    const socket = mockSockets[1];
    const spyRandom = jest.spyOn(Math, 'random');
    spyRandom.mockImplementation(() => 0);
    socketCtrl.handleSitOnTheTable(
      {
        seat: 5,
        tableId: 0,
        chips: 500,
      },
      mockCallback,
      socket
    );

    expect(mockCallback).toHaveBeenCalledWith({ success: true });
    expect(mockIO.sockets.in).toHaveBeenCalledWith('table-0');
    expect(mockIO.to).toHaveBeenCalledWith('sid_player1');
    expect(store.getState().tables.byId[0]).toMatchSnapshot();
  });

  test('player 1 post small blind', () => {
    const socket = mockSockets[0];
    socketCtrl.handlePostBlind(null, mockCallback, socket);
    expect(mockCallback).toHaveBeenCalledWith({ success: true });
    expect(mockIO.sockets.in).toHaveBeenCalledWith('table-0');
    expect(mockIO.to).toHaveBeenCalledWith('sid_player2');
    expect(store.getState().tables.byId[0]).toMatchSnapshot();
  });

  test('player 2 post big blind', () => {
    const socket = mockSockets[1];
    socketCtrl.handlePostBlind(null, mockCallback, socket);
    expect(mockCallback).toHaveBeenCalledWith({ success: true });
    expect(mockIO.sockets.in).toHaveBeenCalledWith('table-0');
    expect(mockIO.to).toHaveBeenCalledWith('sid_player1');
    expect(store.getState().tables.byId[0]).toMatchSnapshot();
  });

  test('player 1 calls small blind with 5', () => {
    const socket = mockSockets[0];
    socketCtrl.handleCall(mockCallback, socket);
    expect(mockCallback).toHaveBeenCalledWith({ success: true });
    expect(mockIO.sockets.in).toHaveBeenCalledWith('table-0');
    expect(mockIO.to).toHaveBeenCalledWith('sid_player2');
    expect(store.getState().tables.byId[0]).toMatchSnapshot();
  });

  test('player 2 (BB) checks', () => {
    const socket = mockSockets[1];
    socketCtrl.handleCheck(mockCallback, socket);
    expect(mockCallback).toHaveBeenCalledWith({ success: true });
    expect(mockIO.sockets.in).toHaveBeenCalledWith('table-0');
    expect(mockIO.to).toHaveBeenCalledWith('sid_player2');
    expect(store.getState().tables.byId[0]).toMatchSnapshot();
  });

  test('Flop: player 2 (BB) bets 15', () => {
    const socket = mockSockets[1];
    socketCtrl.handleBet(15, mockCallback, socket);
    expect(mockCallback).toHaveBeenCalledWith({ success: true });
    expect(mockIO.sockets.in).toHaveBeenCalledWith('table-0');
    expect(mockIO.to).toHaveBeenCalledWith('sid_player1');
    expect(store.getState().tables.byId[0]).toMatchSnapshot();
  });

  test('Flop: player 1 (BB) raises 40', () => {
    const socket = mockSockets[0];
    socketCtrl.handleBet(40, mockCallback, socket);
    expect(mockCallback).toHaveBeenCalledWith({ success: true });
    expect(mockIO.sockets.in).toHaveBeenCalledWith('table-0');
    expect(mockIO.to).toHaveBeenCalledWith('sid_player2');
    expect(store.getState().tables.byId[0]).toMatchSnapshot();
  });

  test('Flop: player 2 (BB) calls 25', () => {
    const socket = mockSockets[1];
    socketCtrl.handleCall(mockCallback, socket);
    expect(mockCallback).toHaveBeenCalledWith({ success: true });
    expect(mockIO.sockets.in).toHaveBeenCalledWith('table-0');
    expect(mockIO.to).toHaveBeenCalledWith('sid_player2');
    expect(store.getState().tables.byId[0]).toMatchSnapshot();
  });
});
