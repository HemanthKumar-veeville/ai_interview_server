const uploadService = require("../services/uploadService");

const uploadController = async (req, res) => {
  try {
    const file = req.file;
    const fileId = req.body.fileId;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded.",
      });
    }

    if (!fileId) {
      return res.status(400).json({
        success: false,
        error: "File ID is required.",
      });
    }

    const key = await uploadService(file, fileId);

    res.status(200).json({
      success: true,
      key,
      message: "Chunk uploaded successfully",
    });
  } catch (error) {
    console.error("Upload error:", error);

    // Handle specific error cases
    if (error.message.includes("chunk size exceeds")) {
      return res.status(413).json({
        success: false,
        error: error.message,
      });
    }

    if (error.message.includes("Invalid file type")) {
      return res.status(415).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: "Upload failed. Please try again.",
      details: error.message,
    });
  }
};

module.exports = uploadController;
