"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBlast = void 0;
const mime_1 = __importDefault(require("mime"));
const logger_1 = require("./logger");
const sendBlast = async (client, receiver, message, type) => {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        //Get the JID if receiver is just number or not
        let number = "";
        if (/[^0-9]/g.test(receiver)) {
            number = receiver;
        }
        else {
            const [result] = await client.onWhatsApp(receiver);
            number = result.jid;
        }
        const msg = JSON.parse(message);
        let res;
        if (type === "text") {
            res = await (client === null || client === void 0 ? void 0 : client.sendMessage(number, {
                text: (_a = msg.text) !== null && _a !== void 0 ? _a : "",
            }));
        }
        else if (type === "image") {
            res = await client.sendMessage(number, {
                caption: (_b = msg.caption) !== null && _b !== void 0 ? _b : "",
                image: { url: (_d = (_c = msg.image) === null || _c === void 0 ? void 0 : _c.url) !== null && _d !== void 0 ? _d : "" },
                mimetype: (_g = mime_1.default.getType((_f = (_e = msg.image) === null || _e === void 0 ? void 0 : _e.url) !== null && _f !== void 0 ? _f : "")) !== null && _g !== void 0 ? _g : "",
            });
        }
        if ((res === null || res === void 0 ? void 0 : res.status) === 1) {
            return true;
        }
        else {
            (0, logger_1.logToFile)({ message: `Failed to send message status: ${res === null || res === void 0 ? void 0 : res.status}` });
            return false;
        }
    }
    catch (error) {
        console.log(error);
        (0, logger_1.logToFile)({ message: `Failed to send message error: ${error}` });
        return false;
    }
};
exports.sendBlast = sendBlast;
