import { Router } from "express";
const router = Router();

router.post("/order-payment", (req, res) => {
  console.log(req.body);
  res.status(200).json({ message: "sent!", status: true });
});

router.post("/cart-create", (req, res) => {
  console.log(req.body);
  res.status(200).json({ message: "sent!", status: true });
});

export default router;
