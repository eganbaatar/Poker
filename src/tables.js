const Table = require('./game/table');

let tables = [];

tables[0] = new Table(
  0,
  'Mongo hevlegch: 10/5 aar',
  eventEmitter(0),
  10,
  10,
  5,
  10000,
  40,
  false,
  15000,
  60000
);
tables[1] = new Table(
  1,
  'Mongonii mashin: 100/50 aar',
  eventEmitter(0),
  10,
  100,
  50,
  100000,
  5000,
  false,
  15000,
  60000
);
tables[2] = new Table(
  2,
  'Sample 6-handed Table',
  eventEmitter(1),
  6,
  100,
  50,
  100000,
  5000,
  false,
  15000,
  60000
);
tables[3] = new Table(
  3,
  'Sample 2-handed Table',
  eventEmitter(2),
  2,
  8,
  4,
  800,
  160,
  false,
  15000,
  60000
);

module.exports = tables;
