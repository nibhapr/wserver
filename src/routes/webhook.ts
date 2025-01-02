import { Request, Router } from "express";
// import { getWebhookUser } from "../services/webhook-service";
import { sessions } from "..";
const router = Router();
router.post("/order-payment", async (req: Request & {rawBody?: string}, res) => {
  // const number = await getWebhookUser(req.rawBody ?? "", req.headers['x-shopify-hmac-sha256'] as string);
  // if (!number) {
  //   res.status(403).json({ message: "Invalid webhook", status: false });
  //   return;
  // }
  const client = sessions.get("917012749946");
  await client?.sendMessage(req.body['shipping_address']['phone'], {text: `Your order has been received!`});
  res.status(200).json({ message: "sent!", status: true });
});

router.post("/cart-create", (req, res) => {
  console.log(req.body);
  res.status(200).json({ message: "sent!", status: true });
});

export default router;
