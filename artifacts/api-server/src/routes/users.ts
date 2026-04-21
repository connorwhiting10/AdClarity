import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.userId = userId;
  next();
};

router.get("/me", requireAuth, async (req: any, res: any) => {
  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, req.userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user.id,
      clerkUserId: user.clerkUserId,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("GET /users/me error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/me", requireAuth, async (req: any, res: any) => {
  try {
    const { email } = req.body as { email: string };
    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }

    const [user] = await db
      .insert(usersTable)
      .values({ clerkUserId: req.userId, email })
      .onConflictDoUpdate({
        target: usersTable.clerkUserId,
        set: { email },
      })
      .returning();

    res.json({
      id: user.id,
      clerkUserId: user.clerkUserId,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("POST /users/me error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
