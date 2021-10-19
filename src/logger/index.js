const Logger = require("./logger");
const storage = require("../storage/index");

const logger = new Logger({
  loggerLabel: "testing-logger",
  storage: storage,
  includeExistingContainers: true,
});

module.exports = logger;
