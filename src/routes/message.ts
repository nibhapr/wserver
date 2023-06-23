import { Router } from "express";
import { sendBulk, sendMedia, sendText } from "../controllers/message";

const router = Router({mergeParams: true})

router.post('/send-text', sendText)
router.post('/send-media', sendMedia)
router.post('/send-bulk', sendBulk)

export default router