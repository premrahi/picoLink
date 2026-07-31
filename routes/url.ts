import express  from "express";
import { handleGenerateShortURL, handleGetAnalytics,trackUrls } from "../controllers/url";
const router = express.Router() ;


router.post('/' , handleGenerateShortURL) ;

// router.get('/analytics/:shortId',handleGetAnalytics )

router.get('/track/:userID' ,trackUrls)

export default router ;