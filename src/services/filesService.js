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

    // Get detailed information about each folder
    const foldersWithDates = await Promise.all(
      CommonPrefixes.map(async (prefix) => {
        const folderParams = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Prefix: prefix.Prefix,
          MaxKeys: 1,
        };

        const response = await s3Client.send(
          new ListObjectsV2Command(folderParams)
        );
        const folderName = prefix.Prefix.split("/")[1];

        // If the folder is empty, use current date as fallback
        const createdDate =
          response.Contents && response.Contents[0]
            ? response.Contents[0].LastModified
            : new Date();

        return {
          name: folderName,
          createdDate: createdDate,
        };
      })
    );

    // Sort folders by date in descending order and return both name and date
    const sortedFolders = foldersWithDates
      .sort((a, b) => b.createdDate - a.createdDate)
      .filter((folder) => folder.name); // Remove any entries with empty names

    return sortedFolders;
  } catch (error) {
    console.error("Error listing folders:", error);
    throw error;
  }
};

module.exports = filesService;
