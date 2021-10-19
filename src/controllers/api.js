const storage = require("../storage/index");
const { logsEmitter } = require("../utils");
const logger = require("../logger/index");

const getContainerLogs = (req, res) => {
  const id = req.params.id;

  storage
    .getLogs(id)
    .then((logs) => {
      res.send(logs);
    })
    .catch((err) => {
      console.error(err);
    });
};

const getContainers = (req, res) => {
  storage
    .getContainers()
    .then((containers) => {
      res.status(200).json(containers);
    })
    .catch((err) => {
      console.error(err);
      res.status(400).send("Could not retrieve containers");
    });
};

const attachToContainer = (req, res) => {
  const id = req.params.id;
  try {
    logger.attachToContainer(id);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send(`Could not attach to container: ${id}`);
  }
};

const detachFromContainer = (req, res) => {
  const id = req.params.id;
  try {
    logger.detachFromContainer(id);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send(`Could not detach from container: ${id}`);
  }
};

const streamContainerLogs = (req, res) => {
  const id = req.params.id;

  const headers = {
    Connection: "keep-alive",
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
  };
  res.writeHead(200, headers);

  logsEmitter.on(`message-logged-${id}`, (doc) => {
    res.write(JSON.stringify(doc));
  });
};

module.exports = {
  getContainerLogs,
  streamContainerLogs,
  attachToContainer,
  detachFromContainer,
  getContainers,
};
