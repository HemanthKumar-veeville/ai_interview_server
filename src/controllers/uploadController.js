const uploadService = require("../services/uploadService");

const uploadController = async (req, res) => {
  try {
    const file = req.file;
    const fileId = req.body.fileId;
    if (!file) {
      throw new Error("No file uploaded.");
    }

    const key = await uploadService(file, fileId);
    res.status(200).json({ success: true, key });
  } catch (error) {
    console.error("Upload error:", error);
    res
      .status(500)
      .json({ success: false, error: "Upload failed. Please try again." });
  }
};

module.exports = uploadController;
