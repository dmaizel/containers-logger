const axios = require("axios");
const API_URL = require("../api");

function attach(containerId) {
  const ATTACH_ENDPOINT = `/api/container/${containerId}/logs`;

  console.log(`${API_URL}${ATTACH_ENDPOINT}`);
  axios
    .post(`${API_URL}${ATTACH_ENDPOINT}`)
    .then(() => {
      console.log("Attached to container with id: ", containerId);
    })
    .catch((err) => {
      console.error(err.response.data);
    });
}

module.exports = attach;
