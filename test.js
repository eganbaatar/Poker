var Deck = require("./poker_modules/deck");
var fs = require("fs");

var deck = new Deck();

var samples = [];

for (var i = 0; i < 10000; i++) {
  deck.shuffle();
  var cards = deck.cards.slice();
  //   console.log(cards);
  samples.push(cards);
}

fs.writeFileSync("samples.json", JSON.stringify(samples));
// samples.forEach(function (card) {
//   console.log(card);
// });
