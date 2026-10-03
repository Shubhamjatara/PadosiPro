import express from "express";
import authRouter from "./routes/auth.routes";
import profileRouter from "./routes/profile.routes";
import taskRounter from "./routes/task.routes";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "http://localhost:8081",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "PadosiPro API is running",
  });
});
app.use("/api", authRouter);
app.use("/api", profileRouter);
app.use("/api", taskRounter);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
