import { Response } from "express";
import profileService from "../services/profile.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { updateProfileSchema } from "../validators/profile.schema";

class ProfileController {
  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;

      const result = updateProfileSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid profile data",
          errors: result.error.flatten().fieldErrors,
          formErrors: result.error.flatten().formErrors,
        });
      }

      const user = await profileService.updateProfile(userId, result.data);

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: user,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
  async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;

      const user = await profileService.getProfile(userId);

      return res.status(200).json({
        success: true,
        message: "Profile fetched successfully",
        data: user,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "User not found") {
        return res.status(404).json({
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
}

export default new ProfileController();
