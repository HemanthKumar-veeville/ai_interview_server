const filesService = require("../services/filesService");

const filesController = async (req, res) => {
  try {
    const folders = await filesService();
    res.status(200).json({ success: true, folders });
  } catch (error) {
    console.error("Error listing folders:", error);
    res.status(500).json({
      success: false,
      error: "Failed to list folders. Please try again.",
    });
  }
};

module.exports = filesController;
