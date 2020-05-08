const winston = require("winston");

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "./logs/game-infos.log",
      maxsize: 10000000,
      maxFiles: 10,
    }),
  ],
});

module.exports = logger;
