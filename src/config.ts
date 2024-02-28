import dotenv from "dotenv";

dotenv.config();

const Env: {
  SESSION_SECRET: string;
  PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;
  AWS_S3_BUCKET_NAME: string;
} = {
  SESSION_SECRET: process.env.SESSION_SECRET,
  PORT: Number.parseInt(process.env.PORT),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
};

export default Env;
