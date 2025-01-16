const {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const deleteService = async (folderId) => {
  try {
    if (!process.env.AWS_S3_BUCKET_NAME) {
      throw new Error("AWS_S3_BUCKET_NAME environment variable is not set.");
    }

    // List all objects in the folder
    const listParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Prefix: `AI-Interview-Videos/${folderId}/`,
    };

    const { Contents } = await s3Client.send(
      new ListObjectsV2Command(listParams)
    );

    if (!Contents || Contents.length === 0) {
      throw new Error(`No files found in folder: ${folderId}`);
    }

    // Prepare objects for deletion
    const objectsToDelete = Contents.map((item) => ({
      Key: item.Key,
    }));

    // Delete all objects in the folder
    const deleteParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Delete: {
        Objects: objectsToDelete,
        Quiet: false,
      },
    };

    const deleteResult = await s3Client.send(
      new DeleteObjectsCommand(deleteParams)
    );

    if (deleteResult.Errors && deleteResult.Errors.length > 0) {
      throw new Error(
        `Some files failed to delete: ${JSON.stringify(deleteResult.Errors)}`
      );
    }

    return true;
  } catch (error) {
    console.error("Error in deleteService:", error);
    throw error;
  }
};

module.exports = deleteService;
