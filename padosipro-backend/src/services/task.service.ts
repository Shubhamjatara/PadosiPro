import prisma from "../db/PrismaClient";


class TaskService {
  // Get all tasks
  async getTasks(search?: string, category?: string) {
    const tasks = await prisma.task.findMany({
      where: {
        ...(search
          ? {
              OR: [
                {
                  name: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  description: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),

        ...(category
          ? {
              category: {
                equals: category,
                mode: "insensitive",
              },
            }
          : {}),
      },
      orderBy: [
        {
          category: "asc",
        },
        {
          name: "asc",
        },
      ],
    });

    return tasks;
  }

  // Get tasks grouped by category
  async getTasksByCategory() {
    const tasks = await prisma.task.findMany({
      orderBy: [
        {
          category: "asc",
        },
        {
          name: "asc",
        },
      ],
    });

    const groupedTasks: Record<string, typeof tasks> = {};

    for (const task of tasks) {
      if (!groupedTasks[task.category]) {
        groupedTasks[task.category] = [];
      }

      groupedTasks[task.category].push(task);
    }

    return groupedTasks;
  }

  // Save user's selected tasks
  async saveSelectedTasks(userId: number, taskIds: number[]) {
    // Check that all selected tasks actually exist
    const tasks = await prisma.task.findMany({
      where: {
        id: {
          in: taskIds,
        },
      },
    });

    if (tasks.length !== taskIds.length) {
      throw new Error("One or more selected tasks do not exist");
    }

    await prisma.$transaction(async (tx) => {
      // Remove previous selection
      await tx.userTask.deleteMany({
        where: {
          userId,
        },
      });

      // Save new selection
      await tx.userTask.createMany({
        data: taskIds.map((taskId) => ({
          userId,
          taskId,
        })),
      });
    });

    return this.getSelectedTasks(userId);
  }

  // Get user's selected tasks
  async getSelectedTasks(userId: number) {
    const userTasks = await prisma.userTask.findMany({
      where: {
        userId,
      },
    });

    const taskIds = userTasks.map((userTask) => userTask.taskId);

    if (taskIds.length === 0) {
      return [];
    }

    return prisma.task.findMany({
      where: {
        id: {
          in: taskIds,
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }
}

export default new TaskService();