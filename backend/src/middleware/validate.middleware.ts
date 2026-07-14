import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

/**
 * Runs after express-validator chains — sends 400 with first validation error if any.
 */
export function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: errors.array()[0].msg as string,
      errors: errors.array(),
    });
    return;
  }
  next();
}
