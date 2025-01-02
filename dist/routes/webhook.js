"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// import { getWebhookUser } from "../services/webhook-service";
const __1 = require("..");
const router = (0, express_1.Router)();
router.post("/order-payment", async (req, res) => {
    // const number = await getWebhookUser(req.rawBody ?? "", req.headers['x-shopify-hmac-sha256'] as string);
    // if (!number) {
    //   res.status(403).json({ message: "Invalid webhook", status: false });
    //   return;
    // }
    const client = __1.sessions.get("917012749946");
    await (client === null || client === void 0 ? void 0 : client.sendMessage(req.body['shipping_address']['phone'], { text: `Your order has been received!` }));
    res.status(200).json({ message: "sent!", status: true });
});
router.post("/cart-create", (req, res) => {
    console.log(req.body);
    res.status(200).json({ message: "sent!", status: true });
});
exports.default = router;
