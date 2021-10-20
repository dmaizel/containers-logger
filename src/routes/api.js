const express = require("express");
const router = express.Router();
const apiController = require("../controllers/api");

router.get("/api/container/:id/logs", apiController.getContainerLogs);
router.post("/api/container/:id/logs", apiController.attachToContainer);
router.delete("/api/container/:id/logs", apiController.detachFromContainer);
router.get("/api/container/:id/logs/stream", apiController.streamContainerLogs);
router.get("/api/containers", apiController.getContainers);

module.exports = router;
