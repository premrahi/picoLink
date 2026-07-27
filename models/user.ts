import mongoose, { Schema, Document } from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt" ;
import dotenv from "dotenv";
dotenv.config();

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
  getJWT(): Promise<string>; 
  validatePassword(passwordInput: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 20,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email address: " + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  { timestamps: true }
);

userSchema.methods.getJWT = async function (): Promise<string> {
  const user = this as IUser;

  const token = jwt.sign(
    { _id: user._id },
    process.env.JWT_SECRET || "DEFAULT_SECRET_KEY",
    { expiresIn: "7d" }
  );

  return token;
};


userSchema.methods.validatePassword = async function (
  passwordInputByUser: string,
) {
  const user = this;

  const passwordHash = user.password;

  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    passwordHash,
  );

  return isPasswordValid;
};




const User = mongoose.model<IUser>("User", userSchema);

export default User;