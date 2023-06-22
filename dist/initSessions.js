"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./utils/db");
const whatsapp_1 = require("./whatsapp");
const initSessions = async () => {
    init();
    setInterval(async () => {
        init();
    }, 900000);
};
const init = async () => {
    const devices = await db_1.prisma.numbers.findMany();
    devices.forEach((device) => {
        (0, whatsapp_1.initializeWhatsapp)(device.body);
    });
};
exports.default = initSessions;
