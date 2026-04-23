import { Router } from "express";

// TODO (Clerk): import { getAuth } from "@clerk/express";
// TODO (Clerk): import { clerkClient } from "@clerk/express";

const router = Router();

/**
 * GET /api/auth/user
 *
 * Returns the currently authenticated user.
 * Currently a stub — always returns { user: null }.
 *
 * TODO (Clerk): Replace body with:
 *   const { userId } = getAuth(req);
 *   if (!userId) return res.json({ user: null });
 *   const u = await clerkClient.users.getUser(userId);
 *   res.json({
 *     user: {
 *       id: u.id,
 *       email: u.emailAddresses[0]?.emailAddress ?? null,
 *       firstName: u.firstName ?? null,
 *       lastName: u.lastName ?? null,
 *       profileImageUrl: u.imageUrl ?? null,
 *     },
 *   });
 */
router.get("/auth/user", (_req, res) => {
  res.json({ user: null });
});

export default router;
