import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User.model";
import { AppError } from "../middleware/error.middleware";

interface AuthPayload {
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    preferredLanguage: string;
    createdAt: Date;
  };
}

function signToken(userId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AppError("Server configuration error.", 500);

  return jwt.sign({ userId }, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]) ?? "7d",
  });
}

function formatUser(user: IUser): AuthPayload["user"] {
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    preferredLanguage: user.preferredLanguage,
    createdAt: user.createdAt,
  };
}

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<AuthPayload> {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new AppError("An account with that email already exists.", 409);
  }

  const user = await User.create({ name, email, password });
  const token = signToken(user._id.toString());

  return { token, user: formatUser(user) };
}

export async function loginUser(
  email: string,
  password: string
): Promise<AuthPayload> {
  // Explicitly select password (excluded by default)
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError("Invalid email or password.", 401);
  }

  const token = signToken(user._id.toString());
  return { token, user: formatUser(user) };
}

export async function getUserProfile(userId: string): Promise<AuthPayload["user"]> {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found.", 404);
  return formatUser(user);
}

export async function updateUserProfile(
  userId: string,
  updates: { name?: string; preferredLanguage?: string }
): Promise<AuthPayload["user"]> {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!user) throw new AppError("User not found.", 404);
  return formatUser(user);
}
