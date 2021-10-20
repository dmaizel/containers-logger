const { LoggerStrategy } = require("./enums");
const streams = require("stream");
const { logsEmitter } = require("./utils");
const EventEmitter = require("events").EventEmitter;

const Log = require("./models/log");

class ContainerLogger extends EventEmitter {
  constructor({ containerObj, containerId, loggerStrategy, storage }) {
    super();
    this.containerObj = containerObj;
    this.containerId = containerId;
    this.loggerStrategy = loggerStrategy;
    this.storage = storage;
    this.since = null;
  }

  start() {
    // TODO: Refactor to return a promise
    new Promise((resolve, reject) => {
      if (!Object.values(LoggerStrategy).includes(this.loggerStrategy)) {
        reject("No such strategy");
      }

      this._getLatestTimestamp()
        .then((timestamp) => {
          console.log(timestamp);
          this.since = timestamp + 1;
        })
        .finally(resolve);
    })
      .then(() => {
        if (this.loggerStrategy == LoggerStrategy.FROM_BEGGINING) {
          return this._handleFromBeggining();
        }
      })
      .then((stream) => {
        this._handleStream(stream);

        this.containerObj.inspect().then((container) => {
          try {
            this.storage.handleNewLoggedContainer({
              id: container.Id,
              image: container.Config.Image,
              names: [container.Name],
            });
          } catch (err) {
            console.error(err);
          }
        });
      })
      .catch((err) => {
        console.error(err);
      });
  }

  _handleOnAttach() {
    return this.containerObj.attach({
      stream: true,
      stdout: true,
      stderr: true,
    });
  }

  _handleFromBeggining() {
    return this.containerObj.logs({
      follow: true,
      stdout: true,
      stderr: true,
      since: this.since,
    });
  }

  _handleStream(stream) {
    const outStream = new streams.PassThrough({
      // highWaterMark: 1024 * 1024,
    });
    const errStream = new streams.PassThrough();

    outStream.on("data", (data) => this._handleLogMessage(data, "stdout"));
    errStream.on("data", (data) => this._handleLogMessage(data, "stderr"));

    this.containerObj.modem.demuxStream(stream, outStream, errStream);
    stream.on("end", () => {
      console.log("End event was fired");
      outStream.end();
      errStream.end();
    });

    this.on("destroy", () => {
      stream.destroy();
      outStream.destroy();
      errStream.destroy();
    });
  }

  _handleLogMessage(data, source) {
    data = data.toString().trim();

    if (data !== "") {
      const log = new Log(this.containerId, data, source, null);
      this.storage
        .writeLog(log)
        .then((doc) => {
          logsEmitter.emit(`message-logged-${doc.containerId}`, doc);
          console.log("[Success] Log inserted to DB");
        })
        .catch((err) => {
          console.error("[Error] could not store to db: " + err.toString());
        });
    }
  }

  _getLatestTimestamp() {
    return new Promise((resolve, reject) => {
      this.storage
        .getLastLogTimestamp(this.containerId)
        .then((timestamp) => {
          console.log("timestamp: ", timestamp);
          resolve(timestamp);
        })
        .catch((err) => {
          console.error(err);
          reject("Could not retrieve last logged timestamp");
        });
    });
  }
}

module.exports = ContainerLogger;
