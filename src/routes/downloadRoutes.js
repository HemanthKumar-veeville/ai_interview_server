const express = require("express");
const downloadController = require("../controllers/downloadController");

const router = express.Router();

router.get("/:instanceId", downloadController);

module.exports = router;
