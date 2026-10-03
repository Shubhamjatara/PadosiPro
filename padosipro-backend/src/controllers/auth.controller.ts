import { Request, Response } from "express";
import authService from "../services/auth.service";
import jwtService from "../services/jwt.service";
import { AuthRequest } from "../middleware/auth.middleware";
import otpService from "../services/otp.service";
import { loginSchema, registerSchema, verifyEmailSchema } from "../validators/auth.schema";

class AuthController {
  async register(req: Request, res: Response) {
    try {
      const result = registerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid registration data",
          errors: result.error.flatten().fieldErrors,
          formErrors: result.error.flatten().formErrors,
        });
      }

      const { email, password } = result.data;
      const user = await authService.register(email, password);

      const verificationToken = jwtService.sign({
        userId: user.userId,
        is_verified: false,
      });

      return res.status(201).json({
        success: true,
        message: "Registration successful. Please verify your email.",
        data: {
          token: verificationToken,
          is_verified: false,
        },
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "User with this email already exists"
      ) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
  async verifyEmail(req: AuthRequest, res: Response) {
    try {
      const result = verifyEmailSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid verification data",
          errors: result.error.flatten().fieldErrors,
          formErrors: result.error.flatten().formErrors,
        });
      }

      const { otp } = result.data;
      const { userId } = req.user!;
      const user = await authService.verifyEmail(otp, userId);

      const token = jwtService.sign({
        userId: user.userId,
        is_verified: user.emailVerified,
      });

      return res.status(200).json({
        success: true,
        message: "Email verified successfully",
        data: {
          token,
          is_verified: user.emailVerified,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        const clientErrors = [
          "User not found",
          "Email is already verified",
          "OTP not found",
          "OTP has expired",
          "Invalid OTP",
          "Maximum OTP attempts exceeded",
        ];

        if (clientErrors.includes(error.message)) {
          return res.status(400).json({
            success: false,
            message: error.message,
          });
        }
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid login data",
          errors: result.error.flatten().fieldErrors,
          formErrors: result.error.flatten().formErrors,
        });
      }

      const { email, password } = result.data;
      const data = await authService.login(email, password);

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Please verify your email first") {
          return res.status(403).json({
            success: false,
            message: error.message,
            code:"VERIFY_OTP"
          });
        }

        if (error.message === "Invalid email or password") {
          return res.status(401).json({
            success: false,
            message: error.message,
          });
        }
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async resendOtp(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.user!;
      // Check cooldown BEFORE generating new OTP
      await otpService.checkResendCooldown(userId);

      const result = await otpService.resendOtp(userId);

      return res.status(200).json({
        success: true,
        message: "OTP sent successfully",
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "User not found") {
          return res.status(404).json({
            success: false,
            message: error.message,
          });
        }

        if (error.message === "Email is already verified") {
          return res.status(400).json({
            success: false,
            message: error.message,
          });
        }

        if (error.message.startsWith("Please wait")) {
          return res.status(429).json({
            success: false,
            message: error.message,
          });
        }
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

export default new AuthController();
