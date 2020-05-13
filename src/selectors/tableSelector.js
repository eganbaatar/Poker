const { createSelector } = require('reselect');
const { memoize } = require('lodash');

const allTablesById = (state) => state.byId;

const allTablesByArray = (state) => Object.values(state.byId);

const getTableById = createSelector(allTablesById, (tableMap) =>
  memoize((id) => tableMap[id])
);

exports.allTablesById = allTablesById;
exports.allTablesByArray = allTablesByArray;
exports.getTableById = getTableById;
