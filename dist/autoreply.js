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
                var _a, _b, _c, _d, _e, _f;
                if (((_e = ((_c = (_b = (_a = message.message) === null || _a === void 0 ? void 0 : _a.extendedTextMessage) === null || _b === void 0 ? void 0 : _b.text) !== null && _c !== void 0 ? _c : (_d = message.message) === null || _d === void 0 ? void 0 : _d.conversation)) === null || _e === void 0 ? void 0 : _e.toLowerCase()) == autoreply.keyword.toLowerCase()) {
                    (0, message_1.sendBlast)(client, (_f = message.key.remoteJid) !== null && _f !== void 0 ? _f : "", autoreply.reply, autoreply.type);
                }
            });
        });
    }
};
exports.default = initAutoreply;
