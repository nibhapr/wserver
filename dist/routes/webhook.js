"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const __1 = require("..");
const router = (0, express_1.Router)();
router.post("/order-payment", async (req, res) => {
    var _a;
    console.log(req);
    const client = __1.sessions.get("917012749946");
    const result = await (client === null || client === void 0 ? void 0 : client.onWhatsApp("917902708908"));
    await (client === null || client === void 0 ? void 0 : client.sendMessage(result ? result[0].jid : "", {
        text: (_a = JSON.stringify(req)) !== null && _a !== void 0 ? _a : "",
    }));
    res.status(200).json({ message: "sent!", status: true });
});
router.post("/cart-create", (req, res) => {
    console.log(req.body);
    res.status(200).json({ message: "sent!", status: true });
});
exports.default = router;
