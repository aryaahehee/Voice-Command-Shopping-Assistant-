import "dotenv/config";
import app from "./app";
import { connectDB } from "./config/database";
import logger from "./config/logger";

const PORT = parseInt(process.env.PORT ?? "5000", 10);

async function bootstrap(): Promise<void> {
  await connectDB();

  app.listen(PORT, () => {
    logger.info(`🚀 VoiceCart API running on port ${PORT} [${process.env.NODE_ENV ?? "development"}]`);
  });
}

bootstrap().catch((err) => {
  logger.error("Failed to start server", err);
  process.exit(1);
});
