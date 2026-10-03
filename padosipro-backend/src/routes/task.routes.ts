import { Router } from "express";
import taskController from "../controllers/task.controller";
import verifyRequest from "../middleware/auth.middleware";
import isUserVerified from "../middleware/isUserVerified";

const taskRounter = Router();

// Public task catalogue
taskRounter.get("/v1/tasks", taskController.getTasks.bind(taskController));

// Public task search
taskRounter.get(
  "/v1/tasks/search",
  taskController.searchTasks.bind(taskController),
);

// Tasks grouped by category
taskRounter.get(
  "/v1/tasks/categories",
  taskController.getTasksByCategory.bind(taskController),
);

// Protected task selection
taskRounter.put(
  "/v1/tasks/selection",
  verifyRequest,
  isUserVerified,
  taskController.saveSelectedTasks.bind(taskController),
);

// Get user's selected tasks
taskRounter.get(
  "/v1/tasks/selection",
  verifyRequest,
  isUserVerified,
  taskController.getSelectedTasks.bind(taskController),
);

export default taskRounter;
