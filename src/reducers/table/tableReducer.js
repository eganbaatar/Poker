const { createReducer } = require('@reduxjs/toolkit');
const {
  takeSeat,
  startRound,
  endRound,
  postBlind,
  deal,
  act,
  startNewPhase,
} = require('../../actions');
const {
  reduceTakeSeat,
  reduceStartRound,
  reduceEndRound,
  reducePostBlind,
  reduceDeal,
  reduceAct,
  reduceStartNewPhase,
} = require('.');

const tables = createReducer((state = {}), {
  [takeSeat]: (state, action) => reduceTakeSeat(state, action.payload),
  [startRound]: (state, action) => reduceStartRound(state, action.payload),
  [endRound]: (state, action) => reduceEndRound(state, action.payload),
  [postBlind]: (state, action) => reducePostBlind(state, action.payload),
  [deal]: (state, action) => reduceDeal(state, action.payload),
  [act]: (state, action) => reduceAct(state, action.payload),
  [startNewPhase]: (state, action) =>
    reduceStartNewPhase(state, action.payload),
});

module.exports = tables;
