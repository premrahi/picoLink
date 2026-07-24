import { Request, Response } from "express";
import { nanoid } from "nanoid";
import URL from "../models/url";

export async function handleGenerateShortURL(req: Request, res: Response) {
  const body = req.body;

  if (!body?.url) {
    return res.status(400).json({ error: "Url is required!" });
  }

  try {
    const shortID = nanoid(8);

    await URL.create({
      shortId: shortID,
      redirectURL: body.url,
      visitHistory: [],
    });

    return res.status(201).json({ id: shortID });
  } catch (error) {
    console.error("Error generating short URL:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function handleGetAnalytics(req: Request, res: Response) {
  const shortId = req.params.shortId;

  const visits = await URL.findOne({ shortId });
  return res.json({
    totalClicks: visits?.visitHistory.length,
    analytics: visits?.visitHistory,
  });
}



