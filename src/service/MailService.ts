import Env from "@/config";
import IMailService from "@/interface/IMailService";
import { MailTemplatePayload } from "@/types/Mail";
import buffer from "buffer";
import fs from "fs";
import _ from "lodash";
import nodemailer from "nodemailer";
import { SentMessageInfo } from "nodemailer/lib/smtp-transport";
import path from "path";

class MailService implements IMailService {
  transporter: nodemailer.Transporter<SentMessageInfo>;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: Env.SMTP_USER,
        pass: Env.SMTP_PASS,
      },
    });
  }

  compileTemplate<T extends keyof MailTemplatePayload>(
    filename: T,
    data: MailTemplatePayload[T]
  ) {
    const file = fs.readFileSync(path.resolve(`./templates/${filename}`));

    const source = buffer.Buffer.from(file as any, "base64").toString("utf-8");

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
