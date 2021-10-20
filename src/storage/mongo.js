const mongoose = require("mongoose");
const conf = require("../config");

const MONGOOSE_CONNECTED_STATE = 1;

mongoose
  .connect(conf.DB_CONN_STR)
  .then(() => {
    console.info("[Success] connected to db");
  })
  .catch((err) => {
    console.error(err);
  });

const logSchema = new mongoose.Schema(
  {
    containerId: { type: String, index: true },
    createdAt: { type: Number },
    source: { type: String },
    log: { type: String },
  },
  {
    // Make Mongoose use UNIX time
    // According to https://docs.docker.com/engine/api/v1.41/#operation/ContainerLogs
    // logs filtering by time is done with UNIX timestamps
    timestamps: { currentTime: () => Math.floor(Date.now() / 1000) },
  }
);

//const Log = mongoose.connection.readyState[MONGOOSE_CONNECTED_STATE]
//? mongoose.model("Log")
//: mongoose.model("Log", logSchema);

const Log = mongoose.model("Log", logSchema);

const containerSchema = new mongoose.Schema({
  id: { type: String },
  image: { type: String },
  names: { type: [String] },
});
const Container = mongoose.model("Container", containerSchema);

//const Container = mongoose.connection.readyState[MONGOOSE_CONNECTED_STATE]
//? mongoose.model("Container")
//: mongoose.model("Container", containerSchema);

module.exports.getContainers = () => {
  return new Promise((resolve, reject) => {
    Container.find({})
      .wtimeout(5000)
      .exec((err, containers) => {
        if (err) {
          reject();
        }
        resolve(containers);
      });
  });
};

module.exports.writeLog = (log) => {
  const logModel = new Log({
    containerId: log.containerId,
    source: log.source,
    log: log.log,
  });

  return logModel.save();
};

module.exports.getLastLogTimestamp = (containerId) => {
  return new Promise((resolve, reject) => {
    Log.findOne({ id: containerId })
      .sort({ createdAt: -1 })
      .exec((err, log) => {
        if (err) {
          reject();
        }
        resolve(log ? log.createdAt : null);
      });
  });
};

module.exports.getLogs = (containerId) => {
  return new Promise((resolve, reject) => {
    Log.find({ containerId })
      .sort({ _id: 1 })
      .wtimeout(5000)
      .exec((err, logs) => {
        if (err) {
          reject(err);
        }

        resolve(logs);
      });
  });
};

module.exports.handleNewLoggedContainer = (container) => {
  const containerModel = new Container({
    id: container.id,
    image: container.image,
    names: container.names,
  });

  return new Promise((resolve, reject) => {
    Container.findOne({ id: container.id }, (err, container) => {
      if (err) {
        reject();
      }

      if (container) {
        resolve(container);
      } else {
        containerModel
          .save()
          .then((result) => resolve(result))
          .catch((err) => reject(err));
      }
    });
  });
};
