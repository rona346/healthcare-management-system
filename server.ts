import "dotenv/config";
import express from "express";
import { getDiagnosisSuggestions } from "./src/services/gemini";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT =  Number(process.env.PORT) || 3000;

    app.use(
      cors({
        origin: [
          "http://localhost:5173",
          "https://healthcare-management-system-app.netlify.app",
        ],
      })
    );

    app.use(express.json());
  console.log("Gemini Key Loaded:", !!process.env.GEMINI_API_KEY);

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/diagnosis", async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms) {
      return res.status(400).json({
        error: "Symptoms are required",
      });
    }

    const result = await getDiagnosisSuggestions(symptoms);

    res.json({ result });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to generate diagnosis",
    });
  }
});

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on ${PORT}`);
  });
}

startServer();
