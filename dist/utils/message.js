"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBlast = void 0;
const mime_1 = __importDefault(require("mime"));
const sendBlast = async (client, receiver, message, type) => {
    var _a, _b, _c, _d, _e, _f, _g;
    const [result] = await (client === null || client === void 0 ? void 0 : client.onWhatsApp(receiver));
    const msg = JSON.parse(message);
    if (type === "text") {
        await (client === null || client === void 0 ? void 0 : client.sendMessage(result.jid, {
            text: (_a = msg.text) !== null && _a !== void 0 ? _a : "",
        }));
    }
    else if (type === "image") {
        await client.sendMessage(result.jid, {
            caption: (_b = msg.caption) !== null && _b !== void 0 ? _b : "",
            image: { url: (_d = (_c = msg.image) === null || _c === void 0 ? void 0 : _c.url) !== null && _d !== void 0 ? _d : "" },
            mimetype: (_g = mime_1.default.getType((_f = (_e = msg.image) === null || _e === void 0 ? void 0 : _e.url) !== null && _f !== void 0 ? _f : "")) !== null && _g !== void 0 ? _g : "",
        });
    }
};
exports.sendBlast = sendBlast;
