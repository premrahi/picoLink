import express from "express";
import router from "./routes/url";

const app = express();
const PORT = 8001;


app.use("/url" , router) ;

app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));
