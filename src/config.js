const LoggerStrategy = require("./enums");

const conf = {
  PORT: 8888,
  HOST: "0.0.0.0",
  DB_CONN_STR: "mongodb://mongodb:27017/logger",
  LOGGER_STRATEGY: LoggerStrategy.LOGS,
};

module.exports = conf;
