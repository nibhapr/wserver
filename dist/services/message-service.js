"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEachBlast = void 0;
const db_1 = __importDefault(require("../utils/db"));
const message_1 = require("../utils/message");
const sendEachBlast = async (blasts, delay, client) => {
    for (const blast of blasts) {
        const result = await (0, message_1.sendBlast)(client, blast.receiver, blast.message, blast.type);
        if (result) {
            await db_1.default.blasts.update({
                where: { id: blast.id },
                data: {
                    status: "success",
                    updated_at: new Date(),
                },
            });
        }
        else {
            await db_1.default.blasts.update({
                where: { id: blast.id },
                data: {
                    status: "failed",
                    updated_at: new Date(),
                },
            });
        }
        await new Promise((resolve) => setTimeout(resolve, delay * 1000));
    }
};
exports.sendEachBlast = sendEachBlast;
