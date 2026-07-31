import express, { Request, Response } from "express";
import User from "../models/user";
import { validateSignupData } from "../utils/validation";
import { userAuth, AuthenticatedRequest } from "../middlewares/auth";
import bcrypt from "bcrypt";

export const auth = express.Router();

// 1. Get Logged-In User Profile (fixes page refresh state loss)
auth.get("/me", userAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const user = await User.findById(userId).select("-password"); // Omit hashed password

    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    return res.status(200).json(user);
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch user profile: " + err.message });
  }
});

// 2. Signup API
auth.post("/signup", async (req: Request, res: Response) => {
  try {
    validateSignupData(req);

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User already exists with this email!" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: passwordHash,
    });

    const savedUser = await user.save();
    const token = await savedUser.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
      httpOnly: true, // Recommended for security
    });

    // Remove password before returning
    const userObj = savedUser.toObject();
    delete (userObj as any).password;

    return res.json({
      message: `${name}'s data saved successfully!`,
      data: userObj,
    });
  } catch (err: any) {
    return res.status(400).json({ error: "Something went wrong: " + err.message });
  }
});

// 3. Login API
auth.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ error: "Invalid Credentials!" });
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = await user.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
      httpOnly: true,
    });

    const userObj = user.toObject();
    delete (userObj as any).password;

    return res.json(userObj);
  } catch (err: any) {
    return res.status(500).json({ error: "ERROR! : " + err.message });
  }
});

// 4. Logout API
auth.post("/logout", async (req: Request, res: Response) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });

  return res.status(200).json({ message: "Logout Successful!" });
});