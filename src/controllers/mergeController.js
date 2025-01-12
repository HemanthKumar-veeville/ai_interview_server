const mergeService = require("../services/mergeService");

const mergeController = async (req, res) => {
  const instanceId = req.params.instanceId;
  try {
    const mergedKey = await mergeService(instanceId);

    res.status(200).json({ success: true, key: mergedKey });
  } catch (error) {
    console.error("Merge error:", error);
    res
      .status(500)
      .json({ success: false, error: "Merge failed. Please try again." });
  }
};

module.exports = mergeController;
