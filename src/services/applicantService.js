const Applicant = require("../models/Applicant");

const applicantService = {
  // Create new applicant
  create: async (applicantData) => {
    try {
      const applicant = await Applicant.create(applicantData);
      return applicant;
    } catch (error) {
      console.error("Error creating applicant:", error);
      throw error;
    }
  },

  // Get applicant by instanceId
  getByInstanceId: async (instanceId) => {
    try {
      const applicant = await Applicant.findOne({
        where: { instanceId },
      });
      return applicant;
    } catch (error) {
      console.error("Error fetching applicant:", error);
      throw error;
    }
  },

  // Update applicant
  update: async (instanceId, updateData) => {
    try {
      const [updated] = await Applicant.update(updateData, {
        where: { instanceId },
        returning: true,
      });

      if (updated === 0) {
        throw new Error("Applicant not found");
      }

      return await Applicant.findOne({ where: { instanceId } });
    } catch (error) {
      console.error("Error updating applicant:", error);
      throw error;
    }
  },

  // Delete applicant
  delete: async (instanceId) => {
    try {
      const deleted = await Applicant.destroy({
        where: { instanceId },
      });

      if (deleted === 0) {
        throw new Error("Applicant not found");
      }

      return true;
    } catch (error) {
      console.error("Error deleting applicant:", error);
      throw error;
    }
  },

  // List all applicants
  list: async () => {
    try {
      const applicants = await Applicant.findAll({
        order: [["createdAt", "DESC"]],
      });
      return applicants;
    } catch (error) {
      console.error("Error listing applicants:", error);
      throw error;
    }
  },
};

module.exports = applicantService;
