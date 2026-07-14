import { Request, Response, NextFunction } from "express";
import * as AuthService from "../services/auth.service";
import { AuthRequest } from "../middleware/auth.middleware";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };

    const payload = await AuthService.registerUser(name, email, password);

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: payload,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const payload = await AuthService.loginUser(email, password);

    res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      data: payload,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await AuthService.getUserProfile(req.userId!);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, preferredLanguage } = req.body as {
      name?: string;
      preferredLanguage?: string;
    };

    const user = await AuthService.updateUserProfile(req.userId!, {
      name,
      preferredLanguage,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated.",
      data: user,
    });
  } catch (err) {
    next(err);
  }
}
