import fs from "fs";
import path from "path";
import buffer from "buffer";
import _ from "lodash";
import nodemailer from "nodemailer";
import CONFIG from "@/config";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: CONFIG.SMTP_USER,
    pass: CONFIG.SMTP_PASS,
  },
});

function compileTemplate(filename, data) {
  const file = fs.readFileSync(
    path.resolve(__dirname, `../templates/${filename}`)
  );

  const source = buffer.Buffer.from(file, "base64").toString("utf-8");

  return _.template(source, {})(data);
}

async function sendMail({ from = "", to = "", subject = "", html = "" }) {
  await transporter.sendMail({
    from,
    to,
    subject,
    html,
  });
}

export { compileTemplate, sendMail };
