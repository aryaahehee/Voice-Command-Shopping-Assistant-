import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { processVoiceCommand } from "../services/voice.service";

export async function handleVoiceCommand(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { text, language, currentItems } = req.body as {
      text: string;
      language?: string;
      currentItems?: Array<{ name: string; id: string }>;
    };

    const command = await processVoiceCommand(
      text,
      language ?? "en-US",
      currentItems ?? []
    );

    res.status(200).json({ success: true, data: command });
  } catch (err) {
    next(err);
  }
}
