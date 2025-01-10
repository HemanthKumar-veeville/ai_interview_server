const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");

dotenv.config();

// Initialize the S3 client with AWS credentials and region
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Uploads a file to AWS S3.
 * @param {Object} file - The file object containing buffer, originalname, and mimetype.
 * @returns {Promise<string>} - The key of the uploaded file in S3.
 * @throws {Error} - If any step fails, an error is thrown with a descriptive message.
 */
const uploadService = async (file, fileId) => {
  try {
    // Validate required environment variables
    if (!process.env.AWS_S3_BUCKET_NAME || !process.env.AWS_REGION) {
      throw new Error(
        "AWS_S3_BUCKET_NAME or AWS_REGION environment variables are not set."
      );
    }

    // Step 1: Validate the file object
    if (!file || !file.buffer || !file.originalname || !file.mimetype) {
      throw new Error(
        "Invalid file object. Ensure the file has buffer, originalname, and mimetype properties."
      );
    }

    // Step 2: Prepare the S3 upload parameters
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `AI-Interview-Videos/${fileId}/${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    // Step 3: Upload the file to S3
    try {
      await s3Client.send(new PutObjectCommand(params));
      console.log("File uploaded to S3:", params.Key);
      return params.Key; // Return the S3 key for the uploaded file
    } catch (uploadError) {
      console.error("Error uploading chunk to S3:", uploadError);

      // Handle specific AWS SDK errors
      if (uploadError.name === "CredentialsProviderError") {
        throw new Error(
          "AWS credentials are invalid or not configured properly. Please check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY."
        );
      } else if (uploadError.name === "NoSuchBucket") {
        throw new Error(
          `The specified S3 bucket does not exist: ${params.Bucket}`
        );
      } else if (uploadError.name === "AccessDenied") {
        throw new Error(
          "Access denied. Ensure your AWS credentials have the necessary permissions to upload to the S3 bucket."
        );
      } else {
        throw new Error(`Failed to upload chunk to S3: ${uploadError.message}`);
      }
    }
  } catch (error) {
    console.error("Error in uploadService:", error.message);
    throw error; // Re-throw the error to be handled by the caller
  }
};

module.exports = uploadService;
