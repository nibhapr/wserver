import { Router } from "express";
import { createCart } from "../controllers/webhook";
const router = Router({mergeParams: true})

router.post('/cart-create', createCart)

export default router