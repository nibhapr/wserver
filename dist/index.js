"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.sessions = void 0;
const express_1 = __importDefault(require("express"));
const whatsapp_1 = require("./whatsapp");
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const body_parser_1 = __importDefault(require("body-parser"));
const initSessions_1 = __importDefault(require("./initSessions"));
const routes_1 = __importDefault(require("./routes"));
const logger_1 = __importDefault(require("./utils/logger"));
exports.sessions = new Map();
// Boot express
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
exports.io = new socket_io_1.Server(server, { cors: { origin: '*' } });
const port = 3000;
app.use(body_parser_1.default.urlencoded({ extended: false, limit: '50mb', parameterLimit: 100000 }));
app.use(body_parser_1.default.json());
app.use('/', routes_1.default);
// Initialize All devices and set Sessions
(0, initSessions_1.default)();
exports.io.on('connection', (socket) => {
    socket.on('StartConnection', (number) => {
        (0, whatsapp_1.connectToWhatsApp)(number, exports.io); // init a particular device
    });
});
server.listen(port, () => logger_1.default.info(`Server is listening on port ${port}!`));
// Start server
