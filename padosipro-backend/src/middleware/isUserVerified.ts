import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

const verifiedMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
      code: "LOGIN",
    });
  }

  if (!req.user.is_verified) {
    return res.status(401).json({
      success: false,
      message: "Please verify your email first",
      code: "VERIFY_OTP",
    });
  }

  next();
};

export default verifiedMiddleware;
