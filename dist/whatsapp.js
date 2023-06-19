"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToWhatsApp = exports.LogoutDevice = void 0;
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const node_cache_1 = __importDefault(require("node-cache"));
const logger_1 = __importDefault(require("./utils/logger"));
const fs_1 = __importDefault(require("fs"));
const qrcode_1 = require("qrcode");
const db_1 = require("./utils/db");
const _1 = require(".");
const logger = logger_1.default.child({});
logger.level = "trace";
const msgRetryCounterCache = new node_cache_1.default();
// const store = makeInMemoryStore({ logger });
// store?.readFromFile("./baileys_store_multi.json");
// save every 10s
// setInterval(() => {
//   store?.writeToFile("./baileys_store_multi.json");
// }, 10_000);
async function LogoutDevice(number, io) {
    const session = _1.sessions.get(number);
    await (session === null || session === void 0 ? void 0 : session.logout());
    const device = await db_1.prisma.numbers.findFirst({
        where: { body: number },
    });
    if ((device === null || device === void 0 ? void 0 : device.status) === "Connected") {
        await db_1.prisma.numbers.update({
            where: { id: device.id },
            data: { status: "Disconnect" },
        });
    }
    fs_1.default.rmdirSync(`./${number}`, { recursive: true });
    _1.sessions.delete(number);
    connectToWhatsApp(number, io);
}
exports.LogoutDevice = LogoutDevice;
async function connectToWhatsApp(number, io) {
    logger.info("SOCKET READY");
    const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(`${number}`);
    const { version, isLatest } = await (0, baileys_1.fetchLatestBaileysVersion)();
    logger.info(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
    const sock = (0, baileys_1.default)({
        // can provide additional config here
        version,
        printQRInTerminal: true,
        auth: {
            creds: state.creds,
            keys: (0, baileys_1.makeCacheableSignalKeyStore)(state.keys, logger),
        },
        msgRetryCounterCache,
        generateHighQualityLinkPreview: true,
    });
    // store?.bind(sock.ev);
    sock.ev.process(
    // events is a map for event name => event data
    async (events) => {
        var _a, _b, _c, _d, _e, _f;
        // something about the connection changed
        // maybe it closed, or we received all offline message or connection opened
        if (events["connection.update"]) {
            const device = await db_1.prisma.numbers.findFirst({
                where: { body: number },
            });
            const update = events["connection.update"];
            const { connection, lastDisconnect, qr } = update;
            if (qr === null || qr === void 0 ? void 0 : qr.length) {
                let qrcode = await (0, qrcode_1.toDataURL)(qr);
                io.emit("qrcode", {
                    token: number,
                    data: qrcode,
                    message: "Scan QR Code",
                });
            }
            if (connection === "open") {
                await db_1.prisma.numbers.update({
                    where: { id: device === null || device === void 0 ? void 0 : device.id },
                    data: { status: "Connected" },
                });
                const [result] = await sock.onWhatsApp((_b = (_a = sock.user) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : "");
                let ppUrl;
                try {
                    ppUrl = await sock.profilePictureUrl(result.jid, "image");
                }
                catch (error) {
                    logger.error("PROFILE NOT FOUND");
                }
                if (result.jid.replace(/\D/g, "") != number.toString()) {
                    io.emit("number-mismatch");
                    await sock.logout();
                }
                else {
                    io.emit("connection-open", {
                        token: result.jid.replace(/\D/g, ""),
                        user: {
                            name: (_c = sock.user) === null || _c === void 0 ? void 0 : _c.name,
                            id: result.jid.replace(/\D/g, ""),
                        },
                        ppUrl: ppUrl !== null && ppUrl !== void 0 ? ppUrl : null,
                    });
                }
            }
            if (connection === "close") {
                // reconnect if not logged out
                if (((_d = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _d === void 0 ? void 0 : _d.output.statusCode) === 515) {
                    connectToWhatsApp(`${number}`, io);
                }
                if (((_f = (_e = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _e === void 0 ? void 0 : _e.output) === null || _f === void 0 ? void 0 : _f.statusCode) !==
                    baileys_1.DisconnectReason.loggedOut) {
                    if ((device === null || device === void 0 ? void 0 : device.status) === "Connected") {
                        await db_1.prisma.numbers.update({
                            where: { id: device.id },
                            data: { status: "Disconnect" },
                        });
                    }
                    // console.log(lastDisconnect?.error?.name)
                    // connectToWhatsApp(`${number}`, io);
                }
                else {
                    fs_1.default.rmdirSync(`./${number}`, { recursive: true });
                    connectToWhatsApp(`${number}`, io);
                    const device = await db_1.prisma.numbers.findFirst({
                        where: { body: number },
                    });
                    await db_1.prisma.numbers.update({
                        where: { id: device === null || device === void 0 ? void 0 : device.id },
                        data: { status: "Disconnect" },
                    });
                    console.log("Connection closed. You are logged out.");
                }
            }
            console.log("CONNECTION UPDATE", update);
        }
        // credentials updated -- save them
        if (events["creds.update"]) {
            await saveCreds();
        }
        // received a new message
        // if (events["messages.upsert"]) {
        //   const upsert = events["messages.upsert"];
        //   console.log("recv messages ", JSON.stringify(upsert, undefined, 2));
        //   if (upsert.type === "notify") {
        //     for (const msg of upsert.messages) {
        //       if (!msg.key.fromMe) {
        //         console.log("replying to", msg.key.remoteJid);
        //         await sock!.readMessages([msg.key]);
        //         // await sock.sendMessage(msg.key.remoteJid ?? '', {text: msg.message?.extendedTextMessage?.text ?? ''})
        //       }
        //     }
        //   }
        // }
    });
    _1.sessions.set(number, sock);
}
exports.connectToWhatsApp = connectToWhatsApp;
