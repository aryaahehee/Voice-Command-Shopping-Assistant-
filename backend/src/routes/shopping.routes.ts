import { Router } from "express";
import { body, param, query } from "express-validator";
import * as ShoppingController from "../controllers/shopping.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

const router = Router();

// All shopping routes require authentication
router.use(authenticate);

const VALID_CATEGORIES = [
  "produce", "dairy", "bakery", "meat", "beverages",
  "snacks", "frozen", "household", "personal_care", "pantry", "other",
];

const VALID_UNITS = [
  "piece", "kg", "g", "lb", "oz", "liter", "ml",
  "pack", "dozen", "carton", "bottle", "box", "bag", "can", "bunch",
];

// ─── GET /api/shopping ────────────────────────────────────────────────────────
router.get(
  "/",
  [
    query("category").optional().isIn(VALID_CATEGORIES).withMessage("Invalid category."),
    query("checked").optional().isBoolean().withMessage("checked must be true or false."),
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer."),
    query("limit").optional().isInt({ min: 1, max: 200 }).withMessage("Limit must be 1–200."),
    query("sortBy").optional().isIn(["createdAt", "name", "category"]).withMessage("Invalid sortBy."),
    query("sortOrder").optional().isIn(["asc", "desc"]).withMessage("sortOrder must be asc or desc."),
  ],
  validate,
  ShoppingController.listItems
);

// ─── GET /api/shopping/:id ────────────────────────────────────────────────────
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid item ID.")],
  validate,
  ShoppingController.getItem
);

// ─── POST /api/shopping ───────────────────────────────────────────────────────
router.post(
  "/",
  [
    body("name")
      .trim()
      .notEmpty().withMessage("Item name is required.")
      .isLength({ max: 100 }).withMessage("Name must be at most 100 characters."),
    body("quantity")
      .optional()
      .isFloat({ min: 0.01 }).withMessage("Quantity must be greater than 0."),
    body("unit")
      .optional()
      .isIn(VALID_UNITS).withMessage("Invalid unit."),
    body("category")
      .optional()
      .isIn(VALID_CATEGORIES).withMessage("Invalid category."),
    body("notes")
      .optional()
      .trim()
      .isLength({ max: 300 }).withMessage("Notes must be at most 300 characters."),
    body("estimatedPrice")
      .optional()
      .isFloat({ min: 0 }).withMessage("Price cannot be negative."),
    body("brand")
      .optional()
      .trim()
      .isLength({ max: 60 }).withMessage("Brand must be at most 60 characters."),
  ],
  validate,
  ShoppingController.createItem
);

// ─── PATCH /api/shopping/:id ──────────────────────────────────────────────────
router.patch(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid item ID."),
    body("name")
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 }).withMessage("Name must be 1–100 characters."),
    body("quantity")
      .optional()
      .isFloat({ min: 0.01 }).withMessage("Quantity must be greater than 0."),
    body("unit")
      .optional()
      .isIn(VALID_UNITS).withMessage("Invalid unit."),
    body("category")
      .optional()
      .isIn(VALID_CATEGORIES).withMessage("Invalid category."),
    body("notes")
      .optional({ nullable: true })
      .trim()
      .isLength({ max: 300 }).withMessage("Notes must be at most 300 characters."),
    body("estimatedPrice")
      .optional({ nullable: true })
      .isFloat({ min: 0 }).withMessage("Price cannot be negative."),
    body("brand")
      .optional({ nullable: true })
      .trim()
      .isLength({ max: 60 }).withMessage("Brand must be at most 60 characters."),
    body("checked")
      .optional()
      .isBoolean().withMessage("checked must be a boolean."),
  ],
  validate,
  ShoppingController.updateItem
);

// ─── DELETE /api/shopping/checked (clear all checked) ────────────────────────
router.delete("/checked", ShoppingController.clearChecked);

// ─── DELETE /api/shopping/:id ─────────────────────────────────────────────────
router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid item ID.")],
  validate,
  ShoppingController.deleteItem
);

export default router;
