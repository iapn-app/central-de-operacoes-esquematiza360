import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GpsTrackerService } from "./src/server/services/integrations/gpsTrackerService";
import { handleIntegration } from "./src/server/services/integrations/baseIntegration";
import chatHandler from "./api/chat";
import geminiHandler from "./api/gemini";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const gpsService = new GpsTrackerService();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Chat API route for local development
  app.post("/api/chat", chatHandler);
  
  // Generic Gemini API route for local development
  app.post("/api/gemini", geminiHandler);

  // Integration route
  app.post("/api/integrations/gps", handleIntegration(gpsService));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
