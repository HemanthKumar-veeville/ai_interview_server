const express = require("express");
const multer = require("multer");
const uploadController = require("../controllers/uploadController");

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post("/", upload.single("file"), uploadController);

module.exports = router;