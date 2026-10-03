import nodemailer from "nodemailer";
import Environment from "../config/Enviroment";

class EmailService {
  private transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: Environment.SMTP_USER,
      pass: Environment.SMTP_PASS,
    },
  });

  async sendOtp(email: string, otp: string) {
    await this.transporter.sendMail({
      from: Environment.SMTP_FROM,
      to: email,
      subject: "PadosiPro Email Verification",
      text: `Your PadosiPro verification code is ${otp}. This code will expire in 10 minutes.`,
    });
  }
}

export default new EmailService();
