const API_URL = require("../api");
const axios = require("axios");

function containers() {
  const CONTAINERS_ENDPOINT = `/api/containers`;

  axios
    .get(`${API_URL}${CONTAINERS_ENDPOINT}`)
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
