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
      text: "Your order has been confirmed tracking number [Tracking Number]. Delivery within two working days. For any inquiries, WhatsApp us at +971563680897. Watch product videos on our social media: https://linktr.ee/chenarabia?utm_source=linktree_profile_share&ltsid=a25f405b-ead5-4d39-9502-b5b102f1b6a4",
      image: { url: "https://lovosis.in/logo.jpg" },
      caption: "your order",
    });
    res.status(200).json({ message: "sent!", status: true });
  }
);

router.post("/order-create", async (req, res) => {
  console.log(req.body["billing_address"]["phone"]);
  const client = sessions.get("917012749946"); // 971581439355
  const result = await client?.onWhatsApp(
    req.body["billing_address"]["phone"].replace(/\D/g, "")
  );
  await client?.sendMessage(result ? result[0].jid : "", {
    image: { url: "https://lovosis.in/logo.jpg" },
    mimetype: "image/jpeg",
    caption: `Your order has been confirmed tracking number ${
      req.body["number"] ?? "[Tracking Number]"
    }. Delivery within two working days. For any inquiries, WhatsApp us at +971563680897. Watch product videos on our social media: https://linktr.ee/chenarabia?utm_source=linktree_profile_share&ltsid=a25f405b-ead5-4d39-9502-b5b102f1b6a4`,
  });
  res.status(200).json({ message: "sent!", status: true });
});

router.get("/customer-create", async (req, res) => {
  console.log(req.body);
  const client = sessions.get("917012749946");
  const result = await client?.onWhatsApp(
    req.body["billing_address"]["phone"].replace(/\D/g, "")
  );
  await client?.sendMessage(result ? result[0].jid : "", {
    image: { url: "https://lovosis.in/logo.jpg" },
    mimetype: "image/jpeg",
    caption: `Your order has been confirmed tracking number ${
      req.body["number"] ?? "[Tracking Number]"
    }. Delivery within two working days. For any inquiries, WhatsApp us at +971563680897. Watch product videos on our social media: https://linktr.ee/chenarabia?utm_source=linktree_profile_share&ltsid=a25f405b-ead5-4d39-9502-b5b102f1b6a4`,
  });
  res.status(200).json({ message: "Hello World!" });
});
router.get("/test", async (req, res) => {
  console.log(req.body);
  res.status(200).json({ message: "Hello World!" });
});

export default router;
