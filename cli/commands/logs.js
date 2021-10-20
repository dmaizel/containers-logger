const http = require("http");
const chalk = require("chalk");
const axios = require("axios");
const { format_time } = require("../utils");

function logs(containerId, { follow }) {
  let logsEndpoint = `/api/container/${containerId}/logs`;
  if (follow) {
    handleLogsStream(logsEndpoint);
  } else {
    axios
      .get(`http://localhost:8888${logsEndpoint}`)
      .then((logs) => {
        logs.data.forEach((log) => {
          printLogLine(log);
        });
      })
      .catch((err) => {
        console.error(err);
      });
  }
}

const printLogLine = ({ createdAt, source, log }) => {
  // let toPrint = `[${new Date(createdAt * 1000).toISOString()}] `;
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
        hostname: "localhost",
        port: 8889,
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
