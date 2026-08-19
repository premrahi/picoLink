import { Request, Response } from "express";
import { nanoid } from "nanoid";
import URL from "../models/url";
import { AuthenticatedRequest } from "../middlewares/auth";

export async function handleGenerateShortURL(req: AuthenticatedRequest, res: Response) {
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
      createdBy: req.user?._id || undefined,
    });

    return res.status(201).json({ id: shortID });
  } catch (error) {
    console.error("Error generating short URL:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}


export async function handleGetAnalytics(req: AuthenticatedRequest, res: Response) {
  try {
    const shortId = req.params.shortId;
    const authedUserId = req.user?._id;

    const link = await URL.findOne({ shortId });

    if (!link) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    // Only the link's owner can view its analytics.
    if (!authedUserId || link.createdBy?.toString() !== authedUserId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const visits = link.visitHistory;

    // --- Geo breakdown: which location engages the most ---
    const countryCounts = new Map<string, number>();
    for (const v of visits) {
      const key = v.country || "Unknown";
      countryCounts.set(key, (countryCounts.get(key) || 0) + 1);
    }
    const byCountry = [...countryCounts.entries()]
      .map(([country, clicks]) => ({ country, clicks }))
      .sort((a, b) => b.clicks - a.clicks);

    // --- Time-of-day breakdown: which hour (0-23, server-local time) engages the most ---
    const hourCounts = new Array(24).fill(0);
    for (const v of visits) {
      const hour = new Date(v.timeStamp).getHours();
      hourCounts[hour]++;
    }
    const byHour = hourCounts.map((clicks, hour) => ({ hour, clicks }));
    const peakHour = byHour.reduce(
      (best, cur) => (cur.clicks > best.clicks ? cur : best),
      byHour[0]
    );

    // --- Day-of-week breakdown, useful alongside hour-of-day ---
    const dayCounts = new Array(7).fill(0); // 0 = Sunday
    for (const v of visits) {
      dayCounts[new Date(v.timeStamp).getDay()]++;
    }
    const byDayOfWeek = dayCounts.map((clicks, day) => ({ day, clicks }));

    // --- Device breakdown ---
    const deviceCounts = new Map<string, number>();
    for (const v of visits) {
      const key = v.device || "unknown";
      deviceCounts.set(key, (deviceCounts.get(key) || 0) + 1);
    }
    const byDevice = [...deviceCounts.entries()].map(([device, clicks]) => ({
      device,
      clicks,
    }));

    // --- Referrer breakdown ---
    const referrerCounts = new Map<string, number>();
    for (const v of visits) {
      const key = v.referrer || "direct";
      referrerCounts.set(key, (referrerCounts.get(key) || 0) + 1);
    }
    const byReferrer = [...referrerCounts.entries()]
      .map(([referrer, clicks]) => ({ referrer, clicks }))
      .sort((a, b) => b.clicks - a.clicks);

    return res.status(200).json({
      shortId: link.shortId,
      redirectURL: link.redirectURL,
      totalClicks: visits.length,
      topCountry: byCountry[0]?.country || null,
      peakHour: visits.length > 0 ? peakHour.hour : null,
      byCountry,
      byHour,
      byDayOfWeek,
      byDevice,
      byReferrer,
      recentVisits: visits.slice(-20).reverse(),
    });
  } catch (error) {
    console.error("Error in handleGetAnalytics controller:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function trackUrls(req: AuthenticatedRequest, res: Response) {
  try {
    // Always scope to the verified, logged-in user — never trust the
    // :userID route param, or any caller could list another user's links.
    const requestedUserId = req.params.userID;
    const authedUserId = req.user?._id;

    if (!authedUserId) {
      return res.status(401).json({ error: "Please log in!" });
    }

    if (requestedUserId !== authedUserId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const urls = await URL.find({ createdBy: authedUserId });

    return res.status(200).json(urls);
  } catch (error) {
    console.error("Error in trackUrls controller:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}