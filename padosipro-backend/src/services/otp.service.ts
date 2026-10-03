import bcrypt from "bcrypt";
import prisma from "../db/PrismaClient";
import emailService from "./email.service";

class OtpService {
  async generateOtp(userId: number) {
    // 1. Invalidate all previous unused OTPs
    await prisma.otp.updateMany({
      where: {
        userId,
        used: false,
      },
      data: {
        used: true,
      },
    });

    // 2. Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Hash OTP
    const codeHash = await bcrypt.hash(otp, 10);

    // 4. Create new OTP
    await prisma.otp.create({
      data: {
        userId,
        codeHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // Return plain OTP only because
    // EmailService needs it to send the email
    return otp;
  }

  async verifyOtp(userId: number, otp: string) {
    // Get current active OTP
    const otpRecord = await prisma.otp.findFirst({
      where: {
        userId,
        used: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpRecord) {
      throw new Error("OTP not found");
    }

    // Check expiry
    if (otpRecord.expiresAt < new Date()) {
      await prisma.otp.update({
        where: {
          id: otpRecord.id,
        },
        data: {
          used: true,
        },
      });

      throw new Error("OTP has expired");
    }

    // Check maximum attempts
    if (otpRecord.attempts >= 5) {
      await prisma.otp.update({
        where: {
          id: otpRecord.id,
        },
        data: {
          used: true,
        },
      });

      throw new Error("Maximum OTP attempts exceeded");
    }

    // Compare OTP
    const isValid = await bcrypt.compare(otp, otpRecord.codeHash);

    // Wrong OTP
    if (!isValid) {
      const newAttempts = otpRecord.attempts + 1;

      await prisma.otp.update({
        where: {
          id: otpRecord.id,
        },
        data: {
          attempts: newAttempts,
          // 5th wrong attempt → invalidate OTP
          used: newAttempts >= 5,
        },
      });

      if (newAttempts >= 5) {
        throw new Error("Maximum OTP attempts exceeded");
      }

      throw new Error("Invalid OTP");
    }

    // Correct OTP → single use
    await prisma.otp.update({
      where: {
        id: otpRecord.id,
      },
      data: {
        used: true,
      },
    });

    return true;
  }

  async resendOtp(userId: number) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.emailVerified) {
      throw new Error("Email is already verified");
    }

    const otp = await this.generateOtp(user.id);

    await emailService.sendOtp(user.email, otp);

    return {
      userId: user.id,
    };
  }

  async checkResendCooldown(userId: number) {
    const latestOtp = await prisma.otp.findFirst({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // User has never requested an OTP
    if (!latestOtp) {
      return;
    }

    const cooldown = 30 * 1000;

    const timePassed = Date.now() - latestOtp.createdAt.getTime();

    if (timePassed < cooldown) {
      const remainingSeconds = Math.ceil((cooldown - timePassed) / 1000);

      throw new Error(
        `Please wait ${remainingSeconds} seconds before requesting another OTP`,
      );
    }
  }
}

export default new OtpService();
