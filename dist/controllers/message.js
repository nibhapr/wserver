"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBulk = exports.sendMedia = exports.sendText = void 0;
const __1 = require("..");
const mime_1 = __importDefault(require("mime"));
const message_1 = require("../utils/message");
const sendText = async (req, res) => {
    var _a;
    const client = __1.sessions.get(req.body.token);
    const result = await (client === null || client === void 0 ? void 0 : client.onWhatsApp(req.body.number));
    await (client === null || client === void 0 ? void 0 : client.sendMessage(result ? result[0].jid : "", {
        text: (_a = req.body.text) !== null && _a !== void 0 ? _a : "",
    }));
    res.status(200).json({ message: "sent!" });
};
exports.sendText = sendText;
const sendMedia = async (req, res) => {
    var _a, _b, _c, _d, _e, _f;
    const client = __1.sessions.get(req.body.token);
    const result = await (client === null || client === void 0 ? void 0 : client.onWhatsApp(req.body.number));
    if (req.body.type === "pdf") {
        await (client === null || client === void 0 ? void 0 : client.sendMessage(result ? result[0].jid : "", {
            document: { url: (_a = req.body.url) !== null && _a !== void 0 ? _a : "" },
            mimetype: (_c = mime_1.default.getType((_b = req.body.url) !== null && _b !== void 0 ? _b : "")) !== null && _c !== void 0 ? _c : "",
            caption: req.body.caption,
        }));
    }
    else {
        await (client === null || client === void 0 ? void 0 : client.sendMessage(result ? result[0].jid : "", {
            image: { url: (_d = req.body.url) !== null && _d !== void 0 ? _d : "" },
            mimetype: (_f = mime_1.default.getType((_e = req.body.url) !== null && _e !== void 0 ? _e : "")) !== null && _f !== void 0 ? _f : "",
            caption: req.body.caption,
        }));
    }
    res.status(200).json({ message: "sent!" });
};
exports.sendMedia = sendMedia;
const sendBulk = async (req, res) => {
    const client = __1.sessions.get(req.body.data[0].sender);
    if (client) {
        req.body.data.forEach((blast, idx) => {
            setTimeout(async () => {
                await (0, message_1.sendBlast)(client, blast.receiver, blast.message, blast.type);
            }, req.body.delay * 1000 * idx);
        });
    }
    else {
        res.status(404).json({ message: "Whatsapp session not found!" });
    }
};
exports.sendBulk = sendBulk;
