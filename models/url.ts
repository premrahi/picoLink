import mongoose, { Schema, Document } from "mongoose";

export interface IUrl extends Document {
  shortId: string;
  redirectURL: string;
  visitHistory: Array<{ timeStamp: number }>;
  createdBy: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const urlSchema = new Schema<IUrl>(
  {
    shortId: {
      type: String,
      required: true,
      unique: true,
    },
    redirectURL: {
      type: String,
      required: true,
    },
    visitHistory: [{ timeStamp: { type: Number } }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index:true,
    },
  },
  { timestamps: true },
);

const URL = mongoose.model<IUrl>("url", urlSchema);

export default URL;
