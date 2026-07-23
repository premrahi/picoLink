import express  from "express";
import { handleGenerateShortURL } from "../controllers/url";
const router = express.Router() ;





router.post('/' , handleGenerateShortURL) ;

export default router ;