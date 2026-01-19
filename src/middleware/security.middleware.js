import aj from "#config/arcjet.js";
import logger from "#config/logger.js";
import { slidingWindow } from "@arcjet/node";

const isDev = process.env.NODE_ENV !== "production";

const securityMiddleware = async (req, res, next) => {
  try {
    if (isDev) {
      return next(); // 🔑 skip security middleware entirely in dev
    }

    const role = req.user?.role || 'guest';

    const limits = {
      admin: 20,
      user: 10,
      guest: 5,
    };

    const client = aj.withRule(
      slidingWindow({
        mode: "LIVE",
        interval: "1m",
        max: limits[role],
        name: `${role}-rate-limit`,
      })
    );

    const decision = await client.protect(req);

    if (decision.isDenied) {
      if (decision.reason.isRateLimit()) {
        logger.warn("Rate limit exceeded", {
          ip: req.ip,
          role,
          path: req.path,
        });
        return res.status(429).json({
          error: "Forbidden",
          message: "Too many requests",
        });
      }

      if (decision.reason.isShield()) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Request blocked by policy",
        });
      }

      if (decision.reason.isBot()) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Automated requests not allowed",
        });
      }
    }

    next();
  } catch (e) {
    console.error("Arcjet middleware error", e);
    res.status(500).json({
      error: "internal server error",
      message: "security middleware failed",
    });
  }
};


export default securityMiddleware