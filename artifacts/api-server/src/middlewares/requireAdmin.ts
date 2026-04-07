import { type Request, type Response, type NextFunction } from "express";
import { verifyAdminToken } from "../lib/admin.js";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }
  const token = authHeader.slice(7);
  const payload = verifyAdminToken(token);
  if (!payload) {
    res.status(403).json({ error: "Invalid or expired admin token" });
    return;
  }
  (req as Request & { adminUser: typeof payload }).adminUser = payload;
  next();
}
