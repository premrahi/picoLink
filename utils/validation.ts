import { Request } from "express";
import validator from "validator";

export const validateSignupData = (req: Request) => {
  const { name, email, password } = req.body;

  if (!name || name.trim().length === 0) {
    throw new Error("Name is required!");
  } 
  
  if (!email || !validator.isEmail(email)) {
    throw new Error("Email is not valid: " + email);
  } 
  
  if (!password || !validator.isStrongPassword(password)) {
    throw new Error("Password is not strong enough! Use at least 8 characters, with letters, numbers, and symbols.");
  }
};


