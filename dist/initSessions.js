"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const db_1 = require("./utils/db");
const whatsapp_1 = require("./whatsapp");
const initSessions = async () => {
    init();
    setInterval(async () => {
        init();
    }, 30000);
};
const init = async () => {
    const devices = await db_1.prisma.numbers.findMany();
    devices.forEach((device) => {
        (0, whatsapp_1.connectToWhatsApp)(device.body, _1.io);
    });
};
exports.default = initSessions;
