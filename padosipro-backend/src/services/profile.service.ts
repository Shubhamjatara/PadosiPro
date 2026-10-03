import prisma from "../db/PrismaClient";
import type { UpdateProfileInput } from "../validators/profile.schema";

class ProfileService {
  async updateProfile(
    userId: number,
    data: UpdateProfileInput,
  ) {
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        mobileNumber: true,
        address: true,
        businessName: true,
      },
    });

    return user;
  }
  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        mobileNumber: true,
        address: true,
        businessName: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
}

export default new ProfileService();
