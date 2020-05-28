const players = require('./player/playersReducer');
const tables = require('./table/tableReducer');
const reducer = {
  players,
  tables,
};

module.exports = reducer;
