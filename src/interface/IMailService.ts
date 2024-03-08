import { MailTemplatePayload } from "@/types/Mail";
import nodemailer from "nodemailer";
import { SentMessageInfo } from "nodemailer/lib/smtp-transport";

type SendMailProps = {
  from?: string;
  to: string;
  subject: string;
  html: string;
};

export default interface IMailService {
  transporter: nodemailer.Transporter<SentMessageInfo>;
  sendMail: (props: SendMailProps) => Promise<void>;
  compileTemplate: <T extends keyof MailTemplatePayload>(
    filename: T,
    data: MailTemplatePayload[T]
  ) => string;
}
