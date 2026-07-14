import { Router } from "express";
import { body } from "express-validator";
import rateLimit from "express-rate-limit";
import * as VoiceController from "../controllers/voice.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

const router = Router();

// Voice processing is more expensive — tighter rate limit
const voiceLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: { success: false, message: "Too many voice commands. Please slow down." },
});

router.use(authenticate);

// ─── POST /api/voice/process ──────────────────────────────────────────────────
router.post(
  "/process",
  voiceLimiter,
  [
    body("text")
      .trim()
      .notEmpty().withMessage("Voice transcript text is required.")
      .isLength({ max: 500 }).withMessage("Text must be at most 500 characters."),
    body("language")
      .optional()
      .trim()
      .isLength({ min: 2, max: 10 }).withMessage("Invalid language code."),
    body("currentItems")
      .optional()
      .isArray().withMessage("currentItems must be an array."),
  ],
  validate,
  VoiceController.handleVoiceCommand
);

export default router;
