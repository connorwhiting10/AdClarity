import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminAuthRouter from "./auth.js";
import oidcRouter from "./oidc.js";
import usersRouter from "./users.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(oidcRouter);
router.use("/auth", adminAuthRouter);
router.use("/users", usersRouter);

export default router;
