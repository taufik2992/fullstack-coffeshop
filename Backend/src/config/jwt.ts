import jwt from "jsonwebtoken";
import { JWTPayload, UserRole } from "../types";

const JWT_SECRET: jwt.Secret =
  process.env.JWT_SECRET || "default-secret-change-in-production";

const ACCESS_TOKEN_EXPIRY: string =
  process.env.JWT_ACCESS_TOKEN_EXPIRY || "15m";

const REFRESH_TOKEN_EXPIRY: string =
  process.env.JWT_REFRESH_TOKEN_EXPIRY || "7d";

// -----------------------------
// GENERATE ACCESS TOKEN
// -----------------------------
export const generateAccessToken = (payload: {
  userId: string;
  email: string;
  role: UserRole;
}): string => {
  const options: jwt.SignOptions = {
    expiresIn: ACCESS_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"],
    issuer: "coffeeshop-api",
    audience: "coffeeshop-mobile",
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

// -----------------------------
// GENERATE REFRESH TOKEN
// -----------------------------
export const generateRefreshToken = (payload: {
  userId: string;
  email: string;
  role: UserRole;
}): string => {
  const options: jwt.SignOptions = {
    expiresIn: REFRESH_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"],
    issuer: "coffeeshop-api",
    audience: "coffeeshop-mobile",
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

// -----------------------------
// VERIFY TOKEN
// -----------------------------
export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    throw new Error("Invalid or expired token");
  }
};

// -----------------------------
// DECODE TOKEN
// -----------------------------
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
};
