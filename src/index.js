const express = require('express');
const app = express();
const morgan = require('morgan');
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const lessMiddleware = require('less-middleware');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const sharedsession = require('express-socket.io-session');
const _ = require('lodash');
const logger = require('./utils/logger');
const { init } = require('./api/socket');
const publicPath = path.resolve(__dirname, '../public');
const store = require('./models/store');
const { getTableDataForLobby, getPublicTableData } = require('./api/wrapper');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(lessMiddleware(publicPath));
app.use(express.static(publicPath));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('trust proxy', 1);

var session_ = session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: {},
});

app.use(session_);

io.use(
  sharedsession(session_, {
    autoSave: true,
  })
);
app.use(morgan('combined'));

var port = process.env.PORT || 3000;
server.listen(port);
logger.info('Listening on port ' + port);

// The lobby
app.get('/', function (req, res) {
  res.render('index');
});

// The lobby data (the array of tables and their data)
app.get('/lobby-data', function (req, res) {
  const tables = Object.values(store.getState().tables.byId);
  const lobbyTables = tables.map((table) => getTableDataForLobby(table));
  res.send(lobbyTables);
});

// If the table is requested manually, redirect to lobby
app.get('/table-10/:tableId', function (req, res) {
  res.redirect('/');
});

// If the table is requested manually, redirect to lobby
app.get('/table-6/:tableId', function (req, res) {
  res.redirect('/');
});

// If the table is requested manually, redirect to lobby
app.get('/table-2/:tableId', function (req, res) {
  res.redirect('/');
});

// The table data
app.get('/table-data/:tableId', function (req, res) {
  if (
    typeof req.params.tableId !== 'undefined' &&
    typeof tables[req.params.tableId] !== 'undefined'
  ) {
    res.send({ table: tables[req.params.tableId].public });
  }
});

// init socket controller
init(io);
