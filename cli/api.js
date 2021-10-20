const config = require("../src/config");

const API_URL = `http://${config.HOST}:${config.PORT}`;

module.exports = API_URL;
