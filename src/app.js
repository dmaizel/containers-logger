const express = require("express");
const routes = require("./routes/api");
const config = require("../src/config");

const PORT = config.PORT || 8888;

const app = express();
app.use("/", routes);

const logger = require("./logger/index");

app.listen(PORT, config.HOST, () => {
  logger.validate();
  logger.start();
  console.log(`Server is running on port ${PORT}`);
});

module.exports = logger;
