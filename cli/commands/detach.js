const axios = require("axios");
const API_URL = require("../api");

function detach(containerId) {
  let DETACH_ENDPOINT = `/api/container/${containerId}/logs`;

  axios
    .delete(`${API_URL}${DETACH_ENDPOINT}`)
    .then(() => {
      console.log("Detached from container with id: ", containerId);
    })
    .catch((err) => {
      console.error(err.response.data);
    });
}

module.exports = detach;
