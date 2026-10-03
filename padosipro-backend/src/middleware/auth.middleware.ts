import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import jwtService from "../services/jwt.service";
import type { AuthClaims } from "../validators/auth.schema";

export interface AuthRequest extends Request {
  user?: AuthClaims;
}

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required",
        code: "TOKEN_EXPIRED",
      });
    }

    const [type, token, extra] = authHeader.split(" ");

    if (type !== "Bearer" || !token || extra !== undefined) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
        code: "TOKEN_EXPIRED",
      });
    }

    req.user = jwtService.verify(token);

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error instanceof ZodError ? "Invalid token claims" : "Invalid or expired token",
      code: "TOKEN_EXPIRED",
    });
  }
};

export default authMiddleware;
