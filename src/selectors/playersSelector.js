const { createSelector } = require('reselect');
const { memoize } = require('lodash');

const allPlayersById = (state) => state.byId;

const allPlayersByArray = (state) => Object.values(state.byId);

const getPlayerById = createSelector(allPlayersById, (playersMap) =>
  memoize((id) => playersMap[id])
);

const getPlayerByName = createSelector(allPlayersByArray, (players) =>
  memoize((name) => players.find((player) => player.name === name))
);

exports.allPlayersById = allPlayersById;
exports.allPlayersByArray = allPlayersByArray;
exports.getPlayerById = getPlayerById;
exports.getPlayerByName = getPlayerByName;
