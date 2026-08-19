import express  from "express";
import { handleGenerateShortURL, handleGetAnalytics,trackUrls } from "../controllers/url";
import { userAuth, optionalAuth } from "../middlewares/auth";
const router = express.Router() ;


router.post('/', optionalAuth, handleGenerateShortURL) ;

router.get('/analytics/:shortId', userAuth, handleGetAnalytics)

// Auth required: prevents any caller from enumerating another user's links
// by guessing/passing an arbitrary userID in the URL.
router.get('/track/:userID', userAuth, trackUrls)

export default router ;
