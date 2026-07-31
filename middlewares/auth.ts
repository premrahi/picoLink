import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


export interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    [key: string]: any;
  };
}

export const userAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ error: "Please log in!" });
    }

    // 2. Verify JWT token using secret key
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is missing from environment variables!");
    }

    const decoded = jwt.verify(token, secret) as { _id: string };

    req.user = decoded;

    next();
  } catch (err: any) {
    return res.status(401).json({ error: "Invalid or expired token!" });
  }
};