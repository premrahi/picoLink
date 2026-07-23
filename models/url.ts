import mongoose , {Schema , Document } from "mongoose";

export interface IUrl extends Document {
    shortId:string ;
    redirectURL : string ;
    visitHistory: Array<{timeStamp:number}> ;
    createdAt? : Date ;
    updatedAt? : Date ;
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
  },
  { timestamps: true },
);

const URL = mongoose.model<IUrl>('url' , urlSchema) ;

export default URL ;