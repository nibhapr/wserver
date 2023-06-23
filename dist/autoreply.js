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
                var _a, _b, _c, _d, _e;
                if (((_c = (_b = (_a = message.message) === null || _a === void 0 ? void 0 : _a.extendedTextMessage) === null || _b === void 0 ? void 0 : _b.text) !== null && _c !== void 0 ? _c : (_d = message.message) === null || _d === void 0 ? void 0 : _d.conversation) == autoreply.keyword) {
                    (0, message_1.sendBlast)(client, (_e = message.key.remoteJid) !== null && _e !== void 0 ? _e : "", autoreply.reply, autoreply.type);
                }
            });
        });
    }
};
exports.default = initAutoreply;
