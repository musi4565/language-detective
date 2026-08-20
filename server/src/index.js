import app from "./app.js";
import { env } from "./config/env.js";

const port = env.port;
app.listen(port, () => {
  console.log(`Language Detective API running on http://localhost:${port}`);
  console.log(`AI provider: ${env.geminiApiKey ? "gemini" : env.openaiApiKey ? "openai" : "NOT CONFIGURED"}`);
});