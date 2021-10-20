function Log(containerId, log, source, createdAt) {
  this.containerId = containerId;
  this.log = log;
  this.source = source;
  this.createdAt = createdAt;
}

module.exports = Log;
