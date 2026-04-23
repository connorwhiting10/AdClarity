import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminAuthRouter from "./auth.js";
import authUserRouter from "./oidc.js"; // stub — replaced by Clerk routes when installed
import usersRouter from "./users.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authUserRouter);
router.use("/auth", adminAuthRouter);
router.use("/users", usersRouter);

export default router;
