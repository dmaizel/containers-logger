const express = require("express");
const routes = require("./routes/api");

const PORT = 8889;

const app = express();
app.use("/", routes);
// app.use(json.parser)

//const storage = require("../src/storage/index");
//const Logger = require("./logger/logger");

//const logger = new Logger({
//loggerLabel: "testing-logger",
//storage: storage,
//includeExistingContainers: true,
//});

const logger = require("./logger/index");

app.listen(PORT, () => {
  logger.start();
  console.log(`Server is running on port ${PORT}`);
});

module.exports = logger;
