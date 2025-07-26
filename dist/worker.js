"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// file: ./worker.ts
const bullmq_1 = require("bullmq");
const db_1 = __importDefault(require("./utils/db"));
const message_1 = require("./utils/message");
const sessions_1 = __importDefault(require("./utils/sessions"));
const redis_1 = require("./utils/redis");
const worker = new bullmq_1.Worker('blast-queue', async (job) => {
    const { blastId } = job.data;
    // Fetch the latest blast data from the DB
    const blast = await db_1.default.blasts.findUnique({ where: { id: blastId } });
    if (!blast) {
        console.error(`Blast with ID ${blastId} not found.`);
        return;
    }
    // Use a try...catch block for robust error handling
    try {
        const client = sessions_1.default.get(blast.sender);
        const result = await (0, message_1.sendBlast)(client, blast.receiver, blast.message, blast.type);
        if (result) {
            await db_1.default.blasts.update({
                where: { id: blast.id },
                data: { status: 'success', updated_at: new Date() },
            });
            console.log(`Successfully sent message to ${blast.receiver}`);
        }
        else {
            // This 'else' handles cases where sendBlast resolves but indicates failure
            throw new Error('sendBlast returned a falsy result');
        }
    }
    catch (error) {
        console.error(`Failed to send message to ${blast.receiver}:`, error);
        await db_1.default.blasts.update({
            where: { id: blast.id },
            data: { status: 'failed', updated_at: new Date() },
        });
    }
}, {
    connection: redis_1.redis,
    // BullMQ has built-in rate limiting, which is better than setTimeout
    limiter: {
        max: 1, // Max 1 job
        duration: 500, // per 5000 milliseconds (5 seconds)
    },
});
console.log('Worker is listening for jobs...');
