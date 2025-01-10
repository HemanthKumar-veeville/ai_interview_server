const express = require("express");
const mergeController = require("../controllers/mergeController");

const router = express.Router();

router.get("/:instanceId", mergeController);

module.exports = router;
