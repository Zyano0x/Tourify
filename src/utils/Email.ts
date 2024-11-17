import nodemailer from "nodemailer";

import config from "../configs/app.config";

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  template?: string;
}

const SendEmail = async (options: EmailOptions) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: config.EMAIL_HOST,
    port: config.EMAIL_PORT,
    auth: {
      user: config.EMAIL_USERNAME,
      pass: config.EMAIL_PASSWORD,
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: "Zyano <hello@zyano.io>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

export default SendEmail;
