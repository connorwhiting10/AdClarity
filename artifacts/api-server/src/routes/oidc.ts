import { Router } from "express";
import { getAuth, clerkClient } from "@clerk/express";

const router = Router();

/**
 * GET /api/auth/user
 * Returns the currently signed-in user's profile, or { user: null }.
 */
router.get("/auth/user", async (req, res) => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.json({ user: null });
    return;
  }

  try {
    const client = await clerkClient();
    const u = await client.users.getUser(userId);

    res.json({
      user: {
        id: u.id,
        email: u.emailAddresses[0]?.emailAddress ?? null,
        firstName: u.firstName ?? null,
        lastName: u.lastName ?? null,
        profileImageUrl: u.imageUrl ?? null,
      },
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

export default router;
