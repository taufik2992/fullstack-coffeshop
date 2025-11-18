import dotenv from "dotenv";
import app from "./app";
import { connectDatabase } from "./config/database";
import logger from "./utils/logger";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    app.listen(PORT, "0.0.0.0", () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api/v1/docs`);
      logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error("Failed to start server:");
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on("unhandledRejection", (_err: Error) => {
  logger.error("UNHANDLED REJECTION! Shutting down...");
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (_err: Error) => {
  logger.error("UNCAUGHT EXCEPTION! Shutting down...");
  process.exit(1);
});
