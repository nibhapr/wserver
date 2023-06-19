"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./utils/db");
const initSessions = async () => {
    init();
    setInterval(async () => {
        init();
    }, 900000);
};
const init = async () => {
    const devices = await db_1.prisma.numbers.findMany();
    devices.forEach((device) => {
        // connectToWhatsApp(device.body, io);
    });
};
exports.default = initSessions;
