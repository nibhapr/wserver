import { Request, Router } from "express";
// import { getWebhookUser } from "../services/webhook-service";
import { sessions } from "..";
const router = Router();
router.post(
  "/order-payment",
  async (req: Request & { rawBody?: string }, res) => {
    // const number = await getWebhookUser(req.rawBody ?? "", req.headers['x-shopify-hmac-sha256'] as string);
    // if (!number) {
    //   res.status(403).json({ message: "Invalid webhook", status: false });
    //   return;
    // }
    console.log(req.body["billing_address"]["phone"]);
    const client = sessions.get("917012749946");
    const result = await client?.onWhatsApp(
      req.body["billing_address"]["phone"].replace(/\D/g, "")
    );
    await client?.sendMessage(result ? result[0].jid : "", {
      text: "Your order has been received!",
      image: { url: "https://lovosis.in/logo.jpg" }
    });
    res.status(200).json({ message: "sent!", status: true });
  }
);

router.post("/cart-create", async (req, res) => {
  console.log(req.body["billing_address"]["phone"]);
    const client = sessions.get("917012749946");
    const result = await client?.onWhatsApp(
      req.body["billing_address"]["phone"].replace(/\D/g, "")
    );
    await client?.sendMessage(result ? result[0].jid : "", {
      text: "Your order has been received!",
    });
    res.status(200).json({ message: "sent!", status: true });
});

export default router;
