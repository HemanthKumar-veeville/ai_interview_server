const express = require("express");
const applicantController = require("../controllers/applicantController");

const router = express.Router();

// Create new applicant
router.post("/", applicantController.create);

// Get applicant by instanceId
router.get("/:instanceId", applicantController.getByInstanceId);

// Update applicant
router.put("/:instanceId", applicantController.update);

// Delete applicant
router.delete("/:instanceId", applicantController.delete);

// List all applicants
router.get("/", applicantController.list);

module.exports = router;
