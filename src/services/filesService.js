const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const filesService = async () => {
  try {
    if (!process.env.AWS_S3_BUCKET_NAME) {
      throw new Error("AWS_S3_BUCKET_NAME environment variable is not set.");
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Prefix: "AI-Interview-Videos/",
      Delimiter: "/",
    };

    const { CommonPrefixes } = await s3Client.send(
      new ListObjectsV2Command(params)
    );

    if (!CommonPrefixes) {
      return [];
    }

    // Extract folder names from CommonPrefixes
    const folders = CommonPrefixes.map((prefix) => {
      const folderPath = prefix.Prefix;
      return folderPath.split("/")[1]; // Get the folder name without the parent directory
    }).filter(Boolean); // Remove any empty strings

    return folders;
  } catch (error) {
    console.error("Error listing folders:", error);
    throw error;
  }
};

module.exports = filesService;
