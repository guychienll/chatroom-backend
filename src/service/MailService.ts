import CONFIG from "@/config";
import buffer from "buffer";
import fs from "fs";
import _ from "lodash";
import nodemailer from "nodemailer";
import { SentMessageInfo } from "nodemailer/lib/smtp-transport";
import path from "path";

class MailService {
  private transporter: nodemailer.Transporter<SentMessageInfo>;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: CONFIG.SMTP_USER,
        pass: CONFIG.SMTP_PASS,
      },
    });
  }

  compileTemplate(filename, data) {
    const file = fs.readFileSync(
      path.resolve(__dirname, `../templates/${filename}`)
    );

    const source = buffer.Buffer.from(file.toString(), "base64").toString(
      "utf-8"
    );

    return _.template(source, {})(data);
  }

  async sendMail({
    from = '"ChatRoom" <chatroom.noreply@gmail.com>',
    to = "",
    subject = "",
    html = "",
  }) {
    await this.transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
  }
}

export default MailService;
