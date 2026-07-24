import express, { Request, Response } from "express";
import router from "./routes/url";
import { connectDB } from "./config/database";
import URL from "./models/url" ;
import { timeStamp } from "node:console";
const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(express.json());

// Routes
app.use("/url", router);



app.get('/:shortId' , async (req:Request , res :Response) => {
    const shortId:string | string[] = req?.params?.shortId ; 
    const entry = await URL.findOneAndUpdate({
        shortId
    },{$push:{
        visitHistory: {
            timeStamp:Date.now() ,
        }
    }});

    if(entry){
    res.redirect(entry?.redirectURL)
    }
})


// Connect DB first, then spin up the server
connectDB()
  .then(() => {
    console.log("✅ Database connected successfully");
    app.listen(PORT, () => console.log(`🚀 Server started at PORT: ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });