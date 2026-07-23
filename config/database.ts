import mongoose from "mongoose";
require("dotenv").config() ;


if(!process.env.MONGODB_URI){
    throw new Error("Mongo DB URI is not valid in env")
}

const db_url:string =  process.env.MONGODB_URI ;

const connectDB  = async() =>{
    await mongoose.connect(db_url , {
        autoIndex :true ,
    }).then(()=> console.log("DB connected!!!") )
}

module.exports = {
    connectDB ,
}