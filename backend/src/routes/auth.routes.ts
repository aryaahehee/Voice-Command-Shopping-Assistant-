import { Router } from "express";
import { body } from "express-validator";
import * as AuthController from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

const router = Router();

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post(
  "/register",
  [
    body("name")
      .trim()
      .notEmpty().withMessage("Name is required.")
      .isLength({ min: 2, max: 60 }).withMessage("Name must be 2–60 characters."),
    body("email")
      .trim()
      .normalizeEmail()
      .isEmail().withMessage("Please provide a valid email address."),
    body("password")
      .isLength({ min: 6 }).withMessage("Password must be at least 6 characters.")
      .isLength({ max: 128 }).withMessage("Password must be at most 128 characters."),
  ],
  validate,
  AuthController.register
);

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post(
  "/login",
  [
    body("email")
      .trim()
      .normalizeEmail()
      .isEmail().withMessage("Please provide a valid email address."),
    body("password")
      .notEmpty().withMessage("Password is required."),
  ],
  validate,
  AuthController.login
);

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get("/me", authenticate, AuthController.getMe);

// ─── PATCH /api/auth/me ───────────────────────────────────────────────────────
router.patch(
  "/me",
  authenticate,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 60 }).withMessage("Name must be 2–60 characters."),
    body("preferredLanguage")
      .optional()
      .trim()
      .isLength({ min: 2, max: 10 }).withMessage("Invalid language code."),
  ],
  validate,
  AuthController.updateMe
);

export default router;
