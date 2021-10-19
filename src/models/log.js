function Log(containerId, log, source, timeLogged) {
    this.containerId = containerId;
    this.log = log;
    this.source = source;
    this.timeLogged = timeLogged;
}

module.exports = Log;