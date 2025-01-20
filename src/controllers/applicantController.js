const applicantService = require("../services/applicantService");

const applicantController = {
  // Create new applicant
  create: async (req, res) => {
    try {
      const applicant = await applicantService.create(req.body);
      res.status(201).json({
        success: true,
        data: applicant,
      });
    } catch (error) {
      console.error("Create applicant error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create applicant",
        details: error.message,
      });
    }
  },

  // Get applicant by instanceId
  getByInstanceId: async (req, res) => {
    try {
      const applicant = await applicantService.getByInstanceId(
        req.params.instanceId
      );
      if (!applicant) {
        return res.status(404).json({
          success: false,
          error: "Applicant not found",
        });
      }
      res.status(200).json({
        success: true,
        data: applicant,
      });
    } catch (error) {
      console.error("Get applicant error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch applicant",
        details: error.message,
      });
    }
  },

  // Update applicant
  update: async (req, res) => {
    try {
      const applicant = await applicantService.update(
        req.params.instanceId,
        req.body
      );
      res.status(200).json({
        success: true,
        data: applicant,
      });
    } catch (error) {
      console.error("Update applicant error:", error);
      if (error.message === "Applicant not found") {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }
      res.status(500).json({
        success: false,
        error: "Failed to update applicant",
        details: error.message,
      });
    }
  },

  // Delete applicant
  delete: async (req, res) => {
    try {
      await applicantService.delete(req.params.instanceId);
      res.status(200).json({
        success: true,
        message: "Applicant deleted successfully",
      });
    } catch (error) {
      console.error("Delete applicant error:", error);
      if (error.message === "Applicant not found") {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }
      res.status(500).json({
        success: false,
        error: "Failed to delete applicant",
        details: error.message,
      });
    }
  },

  // List all applicants
  list: async (req, res) => {
    try {
      const applicants = await applicantService.list();
      res.status(200).json({
        success: true,
        data: applicants,
      });
    } catch (error) {
      console.error("List applicants error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to list applicants",
        details: error.message,
      });
    }
  },
};

module.exports = applicantController;
