"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const db_1 = require("./utils/db");
const message_1 = require("./utils/message");
const initAutoreply = async (upsert, number) => {
    const autoreplies = await db_1.prisma.autoreplies.findMany({
        where: { device: number },
    });
    const client = _1.sessions.get(number);
    if (client) {
        autoreplies.map((autoreply) => {
            upsert.messages.map((message) => {
                if ((message.message?.extendedTextMessage?.text ??
                    message.message?.conversation)?.toLowerCase() == autoreply.keyword.toLowerCase() &&
                    !message.key.fromMe) {
                    (0, message_1.sendBlast)(client, message.key.remoteJid ?? "", autoreply.reply, autoreply.type);
                }
            });
        });
    }
};
exports.default = initAutoreply;
