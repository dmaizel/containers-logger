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
    this.allContainers = [];
    this.docker = new Docker({ socketPath: "/var/run/docker.sock" });
  }

  validate() {}

  start() {
    if (!this.loggerLabel) {
      return new Error("[Error] logger label is missing!");
    }

    this.storage
      .getContainers()
      .then((containers) => {
        this.allContainers = containers.map((container) => container.id);
        console.log("all:", this.allContainers);

        console.log(
          `Logging containers created for logger with label: ${this.loggerLabel}, `,
          this.attachedContainerLoggers
        );
        this._listenForExistingContainers();
      })
      .catch((err) => {
        console.error(err);
        return;
      });

    this._listenForNewContainers();
  }

  async attachToContainer(containerId) {
    if (this.attachedContainerLoggers[containerId]) {
      throw new Error(`Container with id ${containerId} is already handled`);
    }

    // TODO: Handle attaching to a container which was already attached.
    let lastLoggedAt = null;
    if (this.allContainers.includes(containerId)) {
      try {
        lastLoggedAt = await this.storage.getLastLogTimestamp(containerId);
        console.log("Last time logged: ", lastLoggedAt);
      } catch (err) {
        // Or maybe the server is up and not producing any logs???!
        console.error(err);
        throw new Error("Something is wrong");
      }
    }

    const containerObj = this.docker.getContainer(containerId);
    const loggerStrategy = LoggerStrategy.FROM_BEGGINING;
    const containerLogger = new ContainerLogger({
      containerObj,
      containerId,
      loggerStrategy,
      storage: this.storage,
      since: lastLoggedAt,
    });
    // console.log(this.attachedContainerLoggers);
    this.attachedContainerLoggers[containerId] = containerLogger;
    containerLogger.start();
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

    //if (!this._isLogged(containerId) && this.includeExistingContainers) {
    //console.log(`Container with id ${containerId} won't be handled`);
    //return;
    //}
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
    this.attachToContainer(containerId);
  }

  _isLogged(containerId) {
    return this.allContainers.includes(containerId);
  }
}

module.exports = Logger;
