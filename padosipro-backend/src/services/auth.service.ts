import bcrypt from "bcrypt";
import prisma from "../db/PrismaClient";
import emailService from "./email.service";
import otpService from "./otp.service";
import jwtService from "./jwt.service";
class AuthService {
  async register(email: string, password: string) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // User already exists
    if (existingUser) {
      // Email already verified
      if (existingUser.emailVerified) {
        throw new Error("User with this email already exists");
      }

      // User exists but email is not verified
      const otp = await otpService.generateOtp(existingUser.id);

      await emailService.sendOtp(email, otp);

      return {
        userId: existingUser.id,
        message: "Verification OTP sent again",
      };
    }

    // New user
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });

    // Generate and save OTP
    const otp = await otpService.generateOtp(user.id);

    // Send OTP
    await emailService.sendOtp(email, otp);

    return {
      userId: user.id,
    };
  }
  async verifyEmail(otp: string, userId: number) {
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

    // OTP validation handled by OtpService
    await otpService.verifyOtp(userId, otp);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: true,
      },
    });

    return {
      userId: user.id,
      email: user.email,
      emailVerified: true,
    };
  }
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Email verification check
    if (!user.emailVerified) {
      throw new Error("Please verify your email first");
    }

    // Password check
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate JWT
    const token = jwtService.sign({
      userId: user.id,
      is_verified: user.emailVerified,
    });

    return {
      token,
      is_verified: user.emailVerified,
    };
  }
}

export default new AuthService();
