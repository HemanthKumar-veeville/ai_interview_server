const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const dotenv = require("dotenv");

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const downloadService = async (instanceId) => {
  try {
    if (!instanceId) {
      throw new Error("Instance ID is required");
    }

    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `AI-Interview-Videos/${instanceId}/merged_${instanceId}.webm`,
    });

    const signedUrl = await getSignedUrl(s3Client, getObjectCommand, {
      expiresIn: 3600,
    });

    return signedUrl;
  } catch (error) {
    console.error("Download service error:", error);
    throw error;
  }
};

module.exports = downloadService;
