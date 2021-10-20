const API_URL = require("../api");
const axios = require("axios");

function containers() {
  const CONTAINERS_ENDPOINT = `/api/containers`;

  axios
    .get(`${API_URL}${CONTAINERS_ENDPOINT}`)
    .then((containers) => {
      containers = containers.data;
      console.table(
        containers.map((container) => {
          return {
            id: container.id,
            image: container.image,
            names: container.names,
          };
        })
      );
    })
    .catch((err) => {
      console.error(err);
    });
}

module.exports = containers;
