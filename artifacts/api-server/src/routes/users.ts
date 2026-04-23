import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

// TODO (Clerk): import { getAuth } from "@clerk/express";

const router = Router();

/**
 * GET /api/users/me
 *
 * Returns the DB record for the authenticated user.
 *
 * TODO (Clerk): Replace the auth check with:
 *   const { userId } = getAuth(req);
 *   if (!userId) return res.status(401).json({ error: "Unauthorized" });
 *   const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
 */
router.get("/me", async (req, res) => {
  // Stub: no auth until Clerk is installed
  res.status(401).json({ error: "Unauthorized" });
});

export default router;
