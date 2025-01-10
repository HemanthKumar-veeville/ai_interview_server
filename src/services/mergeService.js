const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command, // Added missing import
} = require("@aws-sdk/client-s3");
const streamToBuffer = require("../utils/streamToBuffer");
const dotenv = require("dotenv");

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const mergeService = async (instanceId) => {
  try {
    // Validate required environment variables
    if (!process.env.AWS_S3_BUCKET_NAME || !process.env.AWS_REGION) {
      throw new Error(
        "AWS_S3_BUCKET_NAME or AWS_REGION environment variables are not set."
      );
    }

    // List all chunks under the instanceId folder
    const listParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Prefix: `AI-Interview-Videos/${instanceId}/`, // Ensure trailing slash
    };

    const { Contents } = await s3Client.send(
      new ListObjectsV2Command(listParams)
    );

    if (!Contents || Contents.length === 0) {
      throw new Error("No chunks found for the given instanceId.");
    }

    // Sort chunks by key (if necessary)
    Contents.sort((a, b) => a.Key.localeCompare(b.Key));

    const mergedChunks = [];

    // Fetch and merge all chunks
    for (const chunk of Contents) {
      const getParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: chunk.Key,
      };

      const { Body } = await s3Client.send(new GetObjectCommand(getParams));

      // Convert stream to buffer
      let chunkData;
      try {
        chunkData = await streamToBuffer(Body);
      } catch (error) {
        console.error(
          `Error converting stream to buffer for chunk ${chunk.Key}:`,
          error
        );
        throw new Error(
          `Failed to process chunk ${chunk.Key}: ${error.message}`
        );
      }

      mergedChunks.push(chunkData);
    }

    // Merge all chunks into a single buffer
    const mergedBuffer = Buffer.concat(mergedChunks);

    // Define the key for the merged file
    const mergedKey = `merged/merged_${instanceId}_${Date.now()}.webm`;

    // Upload the merged file to S3
    const putParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: mergedKey,
      Body: mergedBuffer,
      ContentType: "video/webm",
      Metadata: {
        instanceId: instanceId, // Add instanceId as metadata
      },
    };

    await s3Client.send(new PutObjectCommand(putParams));

    console.log("Chunks merged and uploaded to S3:", mergedKey);
    return mergedKey;
  } catch (error) {
    console.error("Error merging chunks:", error);
    throw error;
  }
};

module.exports = mergeService;
