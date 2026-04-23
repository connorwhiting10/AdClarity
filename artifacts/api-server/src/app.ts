import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";

// TODO (Clerk): import { clerkMiddleware } from "@clerk/express";

const app: Express = express();

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// TODO (Clerk): app.use(clerkMiddleware());

app.use("/api", router);

export default app;
