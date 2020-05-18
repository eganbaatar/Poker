const { clone, take, drop } = require('lodash');

const deck = [
  'As',
  'Ah',
  'Ad',
  'Ac',
  'Ks',
  'Kh',
  'Kd',
  'Kc',
  'Qs',
  'Qh',
  'Qd',
  'Qc',
  'Js',
  'Jh',
  'Jd',
  'Jc',
  'Ts',
  'Th',
  'Td',
  'Tc',
  '9s',
  '9h',
  '9d',
  '9c',
  '8s',
  '8h',
  '8d',
  '8c',
  '7s',
  '7h',
  '7d',
  '7c',
  '6s',
  '6h',
  '6d',
  '6c',
  '5s',
  '5h',
  '5d',
  '5c',
  '4s',
  '4h',
  '4d',
  '4c',
  '3s',
  '3h',
  '3d',
  '3c',
  '2s',
  '2h',
  '2d',
  '2c',
];

const getDeck = () => {
  return clone(deck);
};

/**
 * Fischer-Yetes shuffle
 * @param {String[]} cards
 */
const fisherYates = (cards) => {
  var j, x, i;
  for (i = cards.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = cards[i];
    cards[i] = cards[j];
    cards[j] = x;
  }
  return cards;
};

const shuffle = () => {
  let cards = fisherYates(getDeck());
  let shuffledDeck = [];

  for (let i = 0; i < 52; i++) {
    let randomCard = cards.splice(Math.floor(Math.random() * cards.length), 1);
    shuffledDeck = shuffledDeck.concat(randomCard);
  }
  return shuffledDeck;
};

const deal = (deck, numberOfCards) => {
  if (numberOfCards > deck.length) {
    return {
      dealt: clone(deck),
      remain: [],
    };
  }
  return {
    dealt: take(deck, numberOfCards),
    remain: drop(deck, numberOfCards),
  };
};

exports.shuffle = shuffle;
exports.deal = deal;
