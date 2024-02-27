import dotenv from "dotenv";

dotenv.config();

const CONFIG = {
  SESSION_SECRET: process.env.SESSION_SECRET,
  PORT: process.env.PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
};

export default CONFIG;
