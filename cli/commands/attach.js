const axios = require("axios");

function attach(containerId) {
  let attachEndpoint = `/api/container/${containerId}/logs`;

  axios
    .post(`http://localhost:8888${attachEndpoint}`)
    .then(() => {
      console.log("Attached to container with id: ", containerId);
    })
    .catch((err) => {
      console.error(err.response.data);
    });
}

module.exports = attach;
