const express = require("express");
const multer = require("multer");
const documentController = require("../controllers/documentController");

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// Upload document (resume or cover letter)
router.post("/upload", upload.single("file"), documentController.upload);

module.exports = router;
