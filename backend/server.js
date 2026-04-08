import connectDB from "./src/db/connection.js";
import env from "./src/config/env.js";
import app from "./src/app.js";

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(env.port, () => {
      console.log(`SiteOS API server running on port ${env.port} [${env.nodeEnv}]`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
