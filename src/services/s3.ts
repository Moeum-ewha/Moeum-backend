import { S3Client } from "@aws-sdk/client-s3";
import ServerError from "./error";

if (
  !process.env.AWS_ACCESS_KEY ||
  !process.env.AWS_SECRET_ACCESS_KEY ||
  !process.env.AWS_REGION
) {
  throw new ServerError("AWS environment variable not set", 500);
}

export const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
});

export default s3Client;
