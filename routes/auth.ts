import express, { Request, Response } from "express";
import User from "../models/user";
import { validateSignupData } from "../utils/validation";
import bcrypt from "bcrypt";

export const auth = express.Router();

// signup api / saves new user to database
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
      name: name,
      email: email,
      password: passwordHash,
    });

    const savedUser = await user.save();
    const token = await savedUser.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });

    res.json({
      message: `${name}'s data saved successfully!`,
      data: savedUser,
    });
  } catch (err) {
    res.send("something went wrong " + err);
  }
});

// login api
auth.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      res.status(404).send("Invalid Credentials!");
    }

    if (user) {
      const isPasswordValid = await user.validatePassword(password);
      if (isPasswordValid) {
        const token = await user.getJWT();

        res.cookie("token", token);

        res.send(user);
      } else {
        return res.status(401).send("Invalid credentials");
      }
    }
  } catch (err) {
    res.send("ERROR! : " + err);
  }
});

// logout api
auth.post('/logout' , async(req :Request , res: Response) => {
    res.cookie("token" , null , {
        expires:new Date(Date.now())
    })

    res.send("Logout Successful!") ;
})


