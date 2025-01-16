const deleteService = require("../services/deleteService");

const deleteController = async (req, res) => {
  const { folderId } = req.params;

  try {
    await deleteService(folderId);
    res.status(200).json({
      success: true,
      message: `Folder ${folderId} deleted successfully`,
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete folder",
      details: error.message,
    });
  }
};

module.exports = deleteController;
