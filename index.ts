import express, { Request, Response } from "express";
import cookieParser from "cookie-parser"; 
import cors from "cors";
import router from "./routes/url";
import { auth } from "./routes/auth";
import { connectDB } from "./config/database";
import URL from "./models/url";
import { buildVisitRecord } from "./utils/geo";

const app = express();
const PORT = process.env.PORT || 8001;

// Needed so req.ip / x-forwarded-for reflect the real client when running
// behind a reverse proxy (nginx, Render, etc.) instead of the proxy's IP.
app.set("trust proxy", true);


app.set("trust proxy", 1);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://15.252.11.7",
      "http://picolink.online",  
      "https://picolink.online"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());
app.use(cookieParser()); 

app.use("/", auth);
app.use("/url", router);
app.get("/:shortId", async (req: Request, res: Response) => {
  try {
    const { shortId } = req.params;
    
    const entry = await URL.findOneAndUpdate(
      { shortId },
      {
        $push: {
          visitHistory: buildVisitRecord(req),
        },
      }
    );

    if (entry && entry.redirectURL) {
      
      let destination = entry.redirectURL.trim();
      if (!destination.startsWith("http://") && !destination.startsWith("https://")) {
        destination = `https://${destination}`;
      }

      return res.redirect(302, destination);
    }

    return res.status(404).json({ error: "Short URL not found" });
  } catch (err: any) {
    return res.status(500).json({ error: "Server error during redirect" });
  }
});


connectDB()
  .then(() => {
    console.log("✅ Database connected successfully");
    app.listen(PORT, () => console.log(`🚀 Server started at PORT: ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });