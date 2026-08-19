import mongoose, { Schema, Document } from "mongoose";

export interface IVisit {
  timeStamp: number;
  country?: string;   // ISO country code, e.g. "IN", "US"
  region?: string;    // state/province code from geoip-lite
  city?: string;
  referrer?: string;  // Referer header, "direct" if absent
  device?: "mobile" | "tablet" | "desktop" | "unknown";
}

export interface IUrl extends Document {
  shortId: string;
  redirectURL: string;
  visitHistory: Array<IVisit>;
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
    visitHistory: [
      {
        _id: false,
        timeStamp: { type: Number, required: true },
        country: { type: String },
        region: { type: String },
        city: { type: String },
        referrer: { type: String },
        device: { type: String, enum: ["mobile", "tablet", "desktop", "unknown"] },
      },
    ],
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