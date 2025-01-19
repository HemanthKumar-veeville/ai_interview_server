const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
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

const URL_EXPIRY = 3600; // 1 hour instead of 300 seconds

const generateSignedUrl = async (key) => {
  const getObjectCommand = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  });
  return await getSignedUrl(s3Client, getObjectCommand, {
    expiresIn: URL_EXPIRY,
  });
};

const mergeService = async (instanceId) => {
  try {
    // Validate required environment variables
    if (
      !process.env.AWS_S3_BUCKET_NAME ||
      !process.env.AWS_REGION ||
      !process.env.AWS_ACCESS_KEY_ID ||
      !process.env.AWS_SECRET_ACCESS_KEY
    ) {
      throw new Error("Required environment variables are not set.");
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
      throw new Error(`No video chunks found for instance ID: ${instanceId}`);
    }

    // Add validation for file types
    const invalidFiles = Contents.filter((file) => !file.Key.endsWith(".webm"));
    if (invalidFiles.length > 0) {
      throw new Error(
        "Invalid file types detected. Only .webm files are supported."
      );
    }

    if (Contents.length === 1) {
      // Single chunk case: return signed URL for the existing file
      const chunk = Contents[0];
      console.log("Single chunk found, returning signed URL.");
      return await generateSignedUrl(chunk.Key);
    } else if (Contents.length > 1) {
      // Multiple chunks case: merge, upload, and return signed URL
      // Sort chunks by sequence number from the filename
      Contents.sort((a, b) => {
        const getSequenceNumber = (key) => {
          const match = key.match(/_(\d+)\.webm$/);
          return match ? parseInt(match[1]) : 0;
        };
        return getSequenceNumber(a.Key) - getSequenceNumber(b.Key);
      });

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

      // Define the key for the merged file in the same directory
      const mergedKey = `AI-Interview-Videos/${instanceId}/merged_${Date.now()}.webm`;

      // Upload the merged file to S3
      const putParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: mergedKey,
        Body: mergedBuffer,
        ContentType: "video/webm",
        Metadata: {
          instanceId: instanceId,
        },
      };

      await s3Client.send(new PutObjectCommand(putParams));

      console.log("Chunks merged and uploaded to S3:", mergedKey);

      // Add better error handling for chunk deletion
      const deletionErrors = [];
      for (const chunk of Contents) {
        try {
          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET_NAME,
              Key: chunk.Key,
            })
          );
          console.log(`Deleted chunk: ${chunk.Key}`);
        } catch (error) {
          deletionErrors.push({ key: chunk.Key, error: error.message });
        }
      }

      if (deletionErrors.length > 0) {
        console.warn("Some chunks failed to delete:", deletionErrors);
      }

      return await generateSignedUrl(mergedKey);
    }
  } catch (error) {
    console.error("Error in mergeService:", error);
    throw new Error(`Merge operation failed: ${error.message}`);
  }
};

module.exports = mergeService;
