import { Router } from "express";
import { sessions } from "..";
const router = Router();

router.post("/order-payment", async (req, res) => {
  console.log(req);
  const client = sessions.get("917012749946");
  const result = await client?.onWhatsApp("917902708908");
  await client?.sendMessage(result ? result[0].jid : "", {
    text: JSON.stringify(req) ?? "",
  });
  res.status(200).json({ message: "sent!", status: true });
});

router.post("/cart-create", (req, res) => {
  console.log(req.body);
  res.status(200).json({ message: "sent!", status: true });
});

export default router;
