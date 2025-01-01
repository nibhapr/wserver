"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post("/order-payment", (req, res) => {
    console.log(req.body);
    res.status(200).json({ message: "sent!", status: true });
});
router.post("/cart-create", (req, res) => {
    console.log(req.body);
    res.status(200).json({ message: "sent!", status: true });
});
exports.default = router;
