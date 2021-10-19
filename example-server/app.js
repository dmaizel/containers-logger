const express = require("express");

const PORT = 8887;

const app = express();
app.get("/:num", (req, res) => {
  for (let i = 0; i < req.params.num; i++) {
    console.log("Some random string that will be logged num: ", i);
  }

  res.send("Hello");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
