const { createReducer } = require('@reduxjs/toolkit');
const { takeSeat, startRound, postBlind, deal, act } = require('../../actions');
const {
  reduceTakeSeat,
  reduceStartRound,
  reducePostBlind,
  reduceDeal,
  reduceAct,
} = require('.');

const tables = createReducer((state = {}), {
  [takeSeat]: (state, action) => reduceTakeSeat(state, action.payload),
  [startRound]: (state, action) => reduceStartRound(state, action.payload),
  [postBlind]: (state, action) => reducePostBlind(state, action.payload),
  [deal]: (state, action) => reduceDeal(state, action.payload),
  [act]: (state, action) => reduceAct(state, action.payload),
});

module.exports = tables;
