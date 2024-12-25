"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEachBlast = void 0;
const db_1 = require("../utils/db");
const message_1 = require("../utils/message");
const sendEachBlast = async (blasts, delay, client) => {
    for (const [idx, blast] of blasts.entries()) {
        await new Promise((resolve) => setTimeout(resolve, delay * 1000 * idx));
        const result = await (0, message_1.sendBlast)(client, blast.receiver, blast.message, blast.type);
        if (result) {
            await db_1.prisma.blasts.update({
                where: { id: blast.id },
                data: {
                    status: "success",
                    updated_at: new Date(),
                },
            });
        }
        else {
            await db_1.prisma.blasts.update({
                where: { id: blast.id },
                data: {
                    status: "failed",
                    updated_at: new Date(),
                },
            });
        }
    }
};
exports.sendEachBlast = sendEachBlast;
