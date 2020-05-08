/**
 * The deck "class"
 */
var Deck = function () {
  this.nextCard = 0;
  this.cards = [
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
};

function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

// Method that shuffles the deck
Deck.prototype.shuffle = function () {
  // Going back to the top of the deck
  this.nextCard = 0;
  this.cards = shuffle(this.cards);
  var shuffledDeck = [];

  for (var i = 0; i < 52; i++) {
    var random_card = this.cards.splice(
      Math.floor(Math.random() * this.cards.length),
      1
    );
    shuffledDeck = shuffledDeck.concat(random_card);
  }
  this.cards = shuffledDeck;
};

// Method that returns the next x cards of the deck
Deck.prototype.deal = function (numberOfCards) {
  var dealtCards = [];
  for (var i = 0; i < numberOfCards && this.nextCard < 52; i++) {
    dealtCards.push(this.cards[this.nextCard]);
    this.nextCard++;
  }
  return dealtCards;
};

module.exports = Deck;
