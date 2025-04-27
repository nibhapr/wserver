"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const logger_1 = __importDefault(require("./utils/logger"));
const initDebug = async (upsert, number) => {
    const replyNumber = "918943025837";
    const client = _1.sessions.get(number);
    if (client) {
        upsert.messages.map(async (message) => {
            const resultArray = await client.onWhatsApp(message.key.remoteJid);
            const result = Array.isArray(resultArray) && resultArray.length > 0
                ? resultArray[0]
                : { jid: "", exists: false };
            number = result.jid;
            logger_1.default.info(number);
        });
    }
};
exports.default = initDebug;
