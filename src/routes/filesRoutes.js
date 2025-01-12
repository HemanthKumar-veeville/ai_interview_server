const express = require("express");
const filesController = require("../controllers/filesController");

const router = express.Router();

router.get("/folders", filesController);

module.exports = router;
