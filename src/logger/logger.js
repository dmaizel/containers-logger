const Docker = require("dockerode");
const DockerEvents = require("docker-events");
const ContainerLogger = require("../ContainerLogger");
const { LoggerStrategy } = require("../enums");

class Logger {
  constructor({ loggerLabel, storage, includeExistingContainers }) {
    this.attachedContainerLoggers = {};
    this.includeExistingContainers = includeExistingContainers;
    this.loggerLabel = loggerLabel;
    this.storage = storage;
    this.loggedContainers = [];
    this.docker = new Docker({ socketPath: "/var/run/docker.sock" });
  }

  validate() {
    if (!this.loggerLabel) {
      return new Error("[Error] logger label is missing!");
    }
  }

  start() {
    this.storage
      .getContainers()
      .then((containers) => {
        this.loggedContainers = containers.map((container) => container.id);

        console.log(
          `Logging containers created for logger with label: ${this.loggerLabel}, `,
          this.attachedContainerLoggers
        );
        this._listenForExistingContainers();
      })
      .catch((err) => {
        console.error(err);
        throw new Error(
          `Could not retrieve containers for logger with label: , ${this.loggerLabel}`
        );
      });

    this._listenForNewContainers();
  }

  _checkContainerExists(containerId) {
    const containerObj = this.docker.getContainer(containerId);
    return new Promise((resolve, reject) => {
      containerObj
        .inspect()
        .then(() => {
          resolve(containerObj);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  //_checkLastLogged(containerId) {}

  attachToContainer(containerId) {
    return new Promise((resolve, reject) => {
      if (this.attachedContainerLoggers[containerId]) {
        reject(`Container with id ${containerId} is already handled`);
      }

      //// TODO: Handle attaching to a container which was already attached.
      this._checkContainerExists(containerId)
        .then((containerObj) => {
          // Inspect for label in container
          const loggerStrategy = LoggerStrategy.FROM_BEGGINING;
          const containerLogger = new ContainerLogger({
            containerObj,
            containerId,
            loggerStrategy,
            storage: this.storage,
          });
          this.attachedContainerLoggers[containerId] = containerLogger;
          containerLogger.start();
          resolve();
        })
        .catch((err) => {
          console.error(err);
          reject(err);
        });
    });
  }

  detachFromContainer(containerId) {
    const containerLogger = this.attachedContainerLoggers[containerId];
    if (!containerLogger) {
      throw new Error("Container was not attached in the first place");
    }
    containerLogger.emit("destroy");
    delete this.attachedContainerLoggers[containerId];
  }

  _listenForExistingContainers() {
    this.docker.listContainers((err, result) => {
      if (err) {
        console.error(err);
        throw new Error("Could not get existing containers");
      }
      console.log(`Found ${result.length} existing containers`);
      result.forEach(this._handleContainer.bind(this));
    });
  }

  _listenForNewContainers() {
    const dockerEventsEmitter = new DockerEvents({ docker: this.docker });
    dockerEventsEmitter.start();
    dockerEventsEmitter.on("start", this._handleContainer.bind(this));

    console.log("Started listening for new containers");
  }

  _handleContainer(container) {
    const containerId = container.id || container.Id;
    const containerLabel = container.Labels
      ? container.Labels["com.example.logger.label"]
      : container.Actor.Attributes["com.example.logger.label"];

    // Separate validation to to function
    if (!this._isLogged(containerId) && !this.includeExistingContainers) {
      console.log(`Container with id ${containerId} shouldn't be handled`);
      return;
    }

    if (
      this.attachedContainerLoggers[containerId] &&
      this._isLogged(containerId)
    ) {
      console.log(`Container with id ${containerId} is already handled`);
      return;
    }

    if (this.loggerLabel !== containerLabel && !this._isLogged(containerId)) {
      console.log(
        `Container with id ${containerId} doesn't have a matching label.`
      );
      return;
    }

    console.log("Handling container: " + containerId);
    this.attachToContainer(containerId).catch((err) => {
      console.error(err);
      return;
    });
  }

  _isLogged(containerId) {
    return this.loggedContainers.includes(containerId);
  }
}

module.exports = Logger;
