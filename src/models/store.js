const { configureStore, getDefaultMiddleware } = require('@reduxjs/toolkit');
const rootReducer = require('../reducers/reducer');

const preloadedState = {
  tables: {
    byId: {
      0: {
        id: 0,
        name: 'Winna winna chicken dinna: 5/10 aar',
        seatsCount: 10,
        bigBlind: 10,
        smallBlind: 5,
        maxBuyIn: 1000,
        minBuyIn: 500,
        privateTable: false,
        minActionTimeout: 15000,
        maxActionTimeout: 60000,
        seats: [],
        activeSeatsCount: 0,
        gameOn: false,
        board: [],
      },
    },
  },
  players: {
    byId: {},
  },
};

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware(),
  preloadedState,
});

module.exports = store;
