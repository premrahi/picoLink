import express, { Request, Response } from "express";
import cookieParser from "cookie-parser"; 
import cors from "cors";
import router from "./routes/url";
import { auth } from "./routes/auth";
import { connectDB } from "./config/database";
import URL from "./models/url";

const app = express();
const PORT = process.env.PORT || 8001;

// CORS Configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());
app.use(cookieParser()); 

// Routes
app.use("/", auth);
app.use("/url", router);

app.get("/:shortId", async (req: Request, res: Response) => {
  try {
    const { shortId } = req.params;

    const entry = await URL.findOneAndUpdate(
      { shortId },
      {
        $push: {
          visitHistory: {
            timeStamp: Date.now(),
          },
        },
      }
    );

    if (entry && entry.redirectURL) {
      return res.redirect(entry.redirectURL);
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