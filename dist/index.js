"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessions = void 0;
const express_1 = __importDefault(require("express"));
const whatsapp_1 = require("./whatsapp");
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const db_1 = require("./utils/db");
const body_parser_1 = __importDefault(require("body-parser"));
exports.sessions = new Map();
// Boot express
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, { cors: { origin: '*' } });
const port = 3000;
app.use(body_parser_1.default.urlencoded({ extended: false, limit: '50mb', parameterLimit: 100000 }));
app.use(body_parser_1.default.json());
const getDevices = async () => {
    const devices = await db_1.prisma.numbers.findMany();
    devices.forEach(device => {
        (0, whatsapp_1.connectToWhatsApp)(device.body, io);
    });
};
getDevices();
io.on("connection", (socket) => {
    socket.on('StartConnection', (number) => {
        (0, whatsapp_1.connectToWhatsApp)(number, io);
    });
});
app.post('/send-text', async (req, res) => {
    var _a;
    const client = exports.sessions.get(req.body.token);
    const result = await (client === null || client === void 0 ? void 0 : client.onWhatsApp(req.body.number));
    await (client === null || client === void 0 ? void 0 : client.sendMessage(result ? result[0].jid : '', { text: (_a = req.body.text) !== null && _a !== void 0 ? _a : '' }));
    console.log(req.body);
    res.status(200).json({ message: 'sent!' });
});
server.listen(port, () => console.log(`Server is listening on port ${port}!`));
// Start server
