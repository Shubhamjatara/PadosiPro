import { Router } from "express";
import authController from "../controllers/auth.controller";
import authMiddleware from "../middleware/auth.middleware";

const authRouter = Router();
authRouter.post(
  "/v1/resend-otp",
  authMiddleware,
  authController.resendOtp.bind(authController),
);
authRouter.post("/v1/login", authController.login.bind(authController));
authRouter.post("/v1/register", authController.register.bind(authController));
authRouter.post(
  "/v1/verify",
  authMiddleware,
  authController.verifyEmail.bind(authController),
);


export default authRouter;
