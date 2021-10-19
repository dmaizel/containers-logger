const Docker = require('dockerode')
const ContainerLogger = require('../src/ContainerLogger');
const { LoggerStrategy } = require('../src/enums');

const docker = new Docker({socketPath: '/var/run/docker.sock'})
const testContainer = docker.getContainer('6f567f84a65f');
const containerObj = testContainer;
const loggerStrategy = LoggerStrategy.ON_ATTACH;
const containerLogger = new ContainerLogger({containerObj, loggerStrategy});
containerLogger.start()