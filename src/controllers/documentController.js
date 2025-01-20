const documentService = require("../services/documentService");

const documentController = {
  upload: async (req, res) => {
    try {
      const { instanceId, documentType } = req.body;
      const file = req.file;

      if (!instanceId || !documentType) {
        return res.status(400).json({
          success: false,
          error: "Instance ID and document type are required",
        });
      }

      if (!file) {
        return res.status(400).json({
          success: false,
          error: "No file uploaded",
        });
      }

      // Upload document to S3
      const { url, key } = await documentService.upload(
        file,
        instanceId,
        documentType
      );

      res.status(200).json({
        success: true,
        data: {
          url,
          key,
          documentType,
        },
      });
    } catch (error) {
      console.error("Document upload error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to upload document",
        details: error.message,
      });
    }
  },
};

module.exports = documentController;
