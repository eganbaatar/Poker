const addPlayer = (state, { id, name, chips }) => {
  state.byId[id] = { id, name, chips, seat: -1 };
  return state;
};

module.exports = addPlayer;
