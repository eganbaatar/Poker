const players = require('./playersReducer');
const tables = require('./tableReducer');
const reducer = {
  players,
  tables,
};

module.exports = reducer;
