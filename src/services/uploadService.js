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
  maxAttempts: 3, // Built-in retry mechanism
  requestTimeout: 300000, // 5 minutes timeout
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const uploadWithRetry = async (params, maxRetries = 3, baseDelay = 1000) => {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const command = new PutObjectCommand(params);
      await s3Client.send(command);
      return;
    } catch (error) {
      lastError = error;
      console.warn(`Upload attempt ${attempt + 1} failed:`, error.message);

      // Check if error is retriable
      if (!isRetriableError(error)) {
        throw error;
      }

      // Exponential backoff with jitter
      if (attempt < maxRetries - 1) {
        const backoffDelay =
          baseDelay * Math.pow(2, attempt) * (0.5 + Math.random());
        await delay(backoffDelay);
      }
    }
  }

  throw lastError;
};

const isRetriableError = (error) => {
  const retriableErrors = [
    "NetworkingError",
    "TimeoutError",
    "RequestTimeout",
    "RequestThrottled",
    "InternalError",
    "SlowDown",
  ];

  return (
    retriableErrors.includes(error.name) || error.message.includes("timeout")
  );
};

const validateChunk = (file) => {
  const maxChunkSize = 50 * 1024 * 1024; // 5MB

  if (!file || !file.buffer || !file.originalname || !file.mimetype) {
    throw new Error("Invalid file chunk. Missing required properties.");
  }

  if (file.buffer.length > maxChunkSize) {
    throw new Error(
      `Chunk size exceeds maximum allowed size of ${maxChunkSize} bytes`
    );
  }
};

const uploadService = async (file, fileId) => {
  try {
    // Validate environment variables
    if (!process.env.AWS_S3_BUCKET_NAME || !process.env.AWS_REGION) {
      throw new Error("Required environment variables are not set.");
    }

    // Validate the chunk
    validateChunk(file);

    // Prepare upload parameters
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `AI-Interview-Videos/${fileId}/${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        "upload-timestamp": Date.now().toString(),
        "chunk-id": fileId,
      },
    };

    // Attempt upload with retry logic
    await uploadWithRetry(params);
    console.log("File uploaded successfully:", params.Key);
    return params.Key;
  } catch (error) {
    console.error("Error in uploadService:", error);

    // Enhanced error handling
    if (error.name === "CredentialsProviderError") {
      throw new Error(
        "AWS credentials are invalid or not configured properly."
      );
    } else if (error.name === "NoSuchBucket") {
      throw new Error(
        `The specified S3 bucket does not exist: ${process.env.AWS_S3_BUCKET_NAME}`
      );
    } else if (error.name === "AccessDenied") {
      throw new Error("Access denied. Check AWS credentials permissions.");
    } else {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }
};

module.exports = uploadService;
