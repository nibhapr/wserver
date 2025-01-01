"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const webhook_1 = require("../controllers/webhook");
const router = (0, express_1.Router)({ mergeParams: true });
router.post('/cart-create', webhook_1.createCart);
exports.default = router;
