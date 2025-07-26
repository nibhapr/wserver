"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blastQueue = exports.redis = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
exports.redis = new ioredis_1.default({
    port: Number(process.env.REDIS_PORT) || 6379, // Defaults to 6379
    host: process.env.REDIS_HOST,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    db: 0, // Defaults to 0
    maxRetriesPerRequest: null
});
exports.blastQueue = new bullmq_1.Queue('blast', { connection: exports.redis });
