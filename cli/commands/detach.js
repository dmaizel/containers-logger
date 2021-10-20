const axios = require("axios");

function detach(containerId) {
  let detachEndpoint = `/api/container/${containerId}/logs`;

  axios
    .delete(`http://localhost:8888${detachEndpoint}`)
    .then(() => {
      console.log("Detached from container with id: ", containerId);
    })
    .catch((err) => {
      console.error(err.response.data);
    });
}

module.exports = detach;
