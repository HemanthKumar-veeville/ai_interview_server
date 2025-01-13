const mergeService = require("../services/mergeService");

const mergeController = async (req, res) => {
  const instanceId = req.params.instanceId;

  if (!instanceId) {
    return res.status(400).json({
      success: false,
      error: "Instance ID is required",
    });
  }

  try {
    const mergedKey = await mergeService(instanceId);
    res.status(200).json({
      success: true,
      key: mergedKey,
      expiresIn: 3600, // Add expiry information
    });
  } catch (error) {
    console.error("Merge error:", error);

    // More specific error responses
    if (error.message.includes("No video chunks found")) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    if (error.message.includes("Invalid file types")) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: "Merge operation failed. Please try again.",
      details: error.message,
    });
  }
};

module.exports = mergeController;
