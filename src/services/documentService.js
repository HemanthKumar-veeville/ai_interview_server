const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const documentService = {
  upload: async (file, instanceId, documentType) => {
    try {
      if (!file || !file.buffer) {
        throw new Error("Invalid file");
      }

      // Validate file type (you might want to add more validation)
      if (!file.mimetype.includes("pdf") && !file.mimetype.includes("doc")) {
        throw new Error(
          "Invalid file type. Only PDF and DOC files are allowed"
        );
      }

      // Create the S3 key based on document type
      const key = `AI-Interview-Documents/${instanceId}/${documentType}_${Date.now()}_${
        file.originalname
      }`;

      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          instanceId,
          documentType,
          originalName: file.originalname,
        },
      };

      await s3Client.send(new PutObjectCommand(params));

      // Return the document URL
      return {
        url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
        key: key,
      };
    } catch (error) {
      console.error("Error in document upload service:", error);
      throw error;
    }
  },
};

module.exports = documentService;
