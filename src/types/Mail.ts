export enum MailTemplate {
  otp = "otp.html",
  register_success = "register-success.html",
  update_password_success = "update-password-success.html",
}

export type MailTemplatePayload = {
  [MailTemplate.otp]: { username: string; otp: string };
  [MailTemplate.register_success]: { name: string; email: string };
  [MailTemplate.update_password_success]: { username: string };
};
