const axios = require("axios");

function containers() {
  let containersEndpoint = `/api/containers`;

  axios
    .get(`http://localhost:8888${containersEndpoint}`)
    .then((containers) => {
      containers.data.forEach((container) => {
        console.log(container);
      });
    })
    .catch((err) => {
      console.error(err);
    });
}

module.exports = containers;
