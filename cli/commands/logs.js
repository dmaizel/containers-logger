const http = require("http");
const chalk = require("chalk");
const axios = require("axios");
const API_URL = require("../api");
const config = require("../../src/config");
const { format_time } = require("../utils");

function logs(containerId, { follow }) {
  let LOGS_ENDPOINT = `/api/container/${containerId}/logs`;

  if (follow) {
    handleLogsStream(LOGS_ENDPOINT);
  } else {
    axios
      .get(`${API_URL}${LOGS_ENDPOINT}`)
      .then((logs) => {
        logs.data.forEach((log) => {
          printLogLine(log);
        });
      })
      .catch((err) => {
        console.error(err.response.data);
      });
  }
}

const printLogLine = ({ createdAt, source, log }) => {
  let toPrint = `[${format_time(createdAt)}] `;
  if (source == "stdout") {
    toPrint += chalk.greenBright(log);
  } else {
    toPrint += chalk.red(log);
  }
  console.log(toPrint);
};

const handleLogsStream = (logsEndpoint) => {
  try {
    http.get(
      {
        agent: false,
        path: `${logsEndpoint}/stream`,
        hostname: config.HOST,
        port: config.PORT,
      },
      (res) =>
        res.on("data", (data) => {
          printLogLine(JSON.parse(data));
        })
    );
  } catch (err) {
    console.error(err);
  }
};

module.exports = logs;
