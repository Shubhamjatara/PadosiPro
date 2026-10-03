import { Request, Response } from "express";
import taskService from "../services/task.service";
import {
  selectedTasksSchema,
  taskQuerySchema,
  taskSearchQuerySchema,
} from "../validators/task.schema";
import { AuthRequest } from "../middleware/auth.middleware";

class TaskController {
  // GET /tasks/search
  async searchTasks(req: Request, res: Response) {
    try {
      const result = taskSearchQuerySchema.safeParse(req.query);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid query parameters",
          errors: result.error.flatten().fieldErrors,
        });
      }

      const { search, category } = result.data;
      const tasks = await taskService.getTasks(search, category);

      return res.status(200).json({
        success: true,
        message: "Tasks fetched successfully",
        data: tasks,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // GET /tasks
  async getTasks(req: Request, res: Response) {
    try {
      const result = taskQuerySchema.safeParse(req.query);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid query parameters",
          errors: result.error.flatten().fieldErrors,
        });
      }

      const { search, category } = result.data;

      const tasks = await taskService.getTasks(search, category);

      return res.status(200).json({
        success: true,
        message: "Tasks fetched successfully",
        data: tasks,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // GET /tasks/categories
  async getTasksByCategory(req: Request, res: Response) {
    try {
      const tasks = await taskService.getTasksByCategory();

      return res.status(200).json({
        success: true,
        message: "Tasks grouped by category",
        data: tasks,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // PUT /tasks/selection
  async saveSelectedTasks(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;

      const result = selectedTasksSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid task selection",
          errors: result.error.flatten().fieldErrors,
          formErrors: result.error.flatten().formErrors,
        });
      }

      const { taskIds } = result.data;

      const tasks = await taskService.saveSelectedTasks(userId, taskIds);

      return res.status(200).json({
        success: true,
        message: "Tasks selected successfully",
        data: tasks,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "One or more selected tasks do not exist"
      ) {
        return res.status(400).json({
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

  // GET /tasks/selection
  async getSelectedTasks(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;

      const tasks = await taskService.getSelectedTasks(userId);

      return res.status(200).json({
        success: true,
        message: "Selected tasks fetched successfully",
        data: tasks,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

export default new TaskController();
