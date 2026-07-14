import OpenAI from "openai";
import logger from "./logger";

let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      logger.warn("OPENAI_API_KEY not set — AI features will use fallback heuristics.");
      // Return a dummy client that will fail gracefully
    }
    openaiClient = new OpenAI({ apiKey: apiKey ?? "missing" });
  }
  return openaiClient;
}
