#!/usr/bin/env node

const logs = require("./commands/logs");
const { Command } = require("commander");
const containers = require("./commands/containers");
const attach = require("./commands/attach");
const detach = require("./commands/detach");

const program = new Command();

program
  .command("logs")
  .description("List containers logs")
  .action(logs)
  .argument(
    "<containerId>",
    "The container ID of whom the logs will be fetched"
  )
  .option("-F, --follow", "Follow log output", "something");

program
  .command("containers")
  .description("List all tracked containers")
  .action(containers);

program
  .command("attach")
  .description("Attach to a specific container")
  .argument("<containerId>", "The ID of the container to attach to")
  .action(attach);

program
  .command("detach")
  .description("Detach from a specific container")
  .argument("<containerId>", "The ID of the container to detach from")
  .action(detach);

program.parse();
