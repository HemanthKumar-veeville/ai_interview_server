const downloadService = require("../services/downloadService");

const downloadController = async (req, res) => {
  const { instanceId } = req.params;

  try {
    const downloadUrl = await downloadService(instanceId);
    res.status(200).json({
      success: true,
      downloadUrl,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate download URL",
      details: error.message,
    });
  }
};

module.exports = downloadController;
