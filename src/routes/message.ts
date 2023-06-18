import { Router } from "express";
import { sendMedia, sendText } from "../controllers/message";

const router = Router({mergeParams: true})

router.post('/send-text', sendText)
router.post('/send-media', sendMedia)

export default router