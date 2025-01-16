const express = require("express");
const deleteController = require("../controllers/deleteController");

const router = express.Router();

router.delete("/folders/:folderId", deleteController);

module.exports = router;
