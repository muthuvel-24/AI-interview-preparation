import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const region = process.env.AWS_REGION || 'ap-south-1';
const bucketName = process.env.S3_BUCKET_NAME || 'interview-prep-resumes';

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'placeholder',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'placeholder',
  },
});

export const generatePresignedUploadUrl = async (fileName: string, fileType: string) => {
  const key = `resumes/${Date.now()}-${fileName.replace(/\s+/g, '_')}`;

  // If AWS keys are placeholders, return local mock storage URL
  if (process.env.AWS_ACCESS_KEY_ID === 'placeholder' || !process.env.AWS_ACCESS_KEY_ID) {
    return {
      uploadUrl: `http://localhost:5000/api/resume/mock-upload?key=${encodeURIComponent(key)}`,
      fileUrl: `http://localhost:5000/uploads/${key}`,
      key,
    };
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

  return { uploadUrl, fileUrl, key };
};
