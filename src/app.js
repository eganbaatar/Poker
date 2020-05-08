var express = require("express"),
  app = express(),
  server = require("http").createServer(app),
  io = require("socket.io").listen(server),
  lessMiddleware = require("less-middleware"),
  path = require("path"),
  Table = require("../poker_modules/table"),
  Player = require("../poker_modules/player");
var session = require("express-session");
var sharedsession = require("express-socket.io-session");
const _ = require("lodash");
const logger = require("./logger");
const socket = require("./socket");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(express.favicon());
app.use(express.logger("dev"));
app.use(express.bodyParser());
app.use(app.router);
app.use(lessMiddleware(__dirname + "/public"));
app.use(express.static(path.join(__dirname, "public")));
app.set("trust proxy", 1); // trust first proxy
var session_ = session({
  secret: "keyboard cat",
  resave: true,
  saveUninitialized: true,
  cookie: {},
});
app.use(session_);

// Development Only
if ("development" == app.get("env")) {
  app.use(express.errorHandler());
}
io.use(
  sharedsession(session_, {
    autoSave: true,
  })
);
var players = [];
var tables = [];
var eventEmitter = {};

var port = process.env.PORT || 3000;
server.listen(port);
logger.info("Listening on port " + port);

// The lobby
app.get("/", function (req, res) {
  res.render("index");
});

// The lobby data (the array of tables and their data)
app.get("/lobby-data", function (req, res) {
  var lobbyTables = [];
  for (var tableId in tables) {
    // Sending the public data of the public tables to the lobby screen
    if (!tables[tableId].privateTable) {
      lobbyTables[tableId] = {};
      lobbyTables[tableId].id = tables[tableId].public.id;
      lobbyTables[tableId].name = tables[tableId].public.name;
      lobbyTables[tableId].seatsCount = tables[tableId].public.seatsCount;
      lobbyTables[tableId].playersSeatedCount =
        tables[tableId].public.playersSeatedCount;
      lobbyTables[tableId].bigBlind = tables[tableId].public.bigBlind;
      lobbyTables[tableId].smallBlind = tables[tableId].public.smallBlind;
    }
  }
  res.send(lobbyTables);
});

// If the table is requested manually, redirect to lobby
app.get("/table-10/:tableId", function (req, res) {
  res.redirect("/");
});

// If the table is requested manually, redirect to lobby
app.get("/table-6/:tableId", function (req, res) {
  res.redirect("/");
});

// If the table is requested manually, redirect to lobby
app.get("/table-2/:tableId", function (req, res) {
  res.redirect("/");
});

// The table data
app.get("/table-data/:tableId", function (req, res) {
  if (
    typeof req.params.tableId !== "undefined" &&
    typeof tables[req.params.tableId] !== "undefined"
  ) {
    res.send({ table: tables[req.params.tableId].public });
  }
});

// register socket controller
socket(io);

/**
 * Event emitter function that will be sent to the table objects
 * Tables use the eventEmitter in order to send events to the client
 * and update the table data in the ui
 * @param string tableId
 */
var eventEmitter = function (tableId) {
  return function (eventName, eventData) {
    io.sockets.in("table-" + tableId).emit(eventName, eventData);
  };
};

/**
 * Changes certain characters in a string to html entities
 * @param string str
 */
function htmlEntities(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isPlayerOnTable(players, pid) {
  const playerInfo = players[pid];
  return (
    !_.isNil(playerInfo) &&
    !_.isNil(playerInfo.sittingOnTable) &&
    playerInfo.sittingOnTable !== false
  );
}

tables[0] = new Table(
  0,
  "Mongo hevlegch: 10/5 aar",
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
  0,
  "Mongonii mashin: 100/50 aar",
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
  1,
  "Sample 6-handed Table",
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
  2,
  "Sample 2-handed Table",
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
