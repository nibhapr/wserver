import { Router } from "express";
import messageRoutes from "./message";
import webhookRoutes from "./webhook";

const router = Router();
router.use("/messages", messageRoutes);
router.use("/api/", webhookRoutes);

export default router;
