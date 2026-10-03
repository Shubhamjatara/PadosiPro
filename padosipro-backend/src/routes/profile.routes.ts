import { Router } from "express";
import profileController from "../controllers/profile.controller";
import authMiddleware from "../middleware/auth.middleware";

const profileRouter = Router();

profileRouter.patch(
  "/v1/profile",
  authMiddleware,
  profileController.updateProfile.bind(profileController),
);

profileRouter.get(
  "/v1/profile",
  authMiddleware,
  profileController.getProfile.bind(profileController),
);

export default profileRouter;
