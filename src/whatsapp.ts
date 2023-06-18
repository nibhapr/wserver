import makeWASocket, {
  DisconnectReason,  
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,    
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import NodeCache from "node-cache";
import MAIN_LOGGER from "./utils/logger";
import fs from "fs";
import type { Server } from "socket.io";
import { toDataURL } from "qrcode";
import { prisma } from "./utils/db";
import { sessions } from ".";

const logger = MAIN_LOGGER.child({});
logger.level = "trace";

const msgRetryCounterCache = new NodeCache();

// const store = makeInMemoryStore({ logger });
// store?.readFromFile("./baileys_store_multi.json");

// save every 10s
// setInterval(() => {
//   store?.writeToFile("./baileys_store_multi.json");
// }, 10_000);

export async function connectToWhatsApp(number: string, io: Server) {
  logger.info("SOCKET READY");
  const { state, saveCreds } = await useMultiFileAuthState(`${number}`);
  const { version, isLatest } = await fetchLatestBaileysVersion();
  logger.info(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
  const sock = makeWASocket({
    // can provide additional config here
    version,
    printQRInTerminal: true,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    msgRetryCounterCache,
    generateHighQualityLinkPreview: true,
  });

  // store?.bind(sock.ev);
  sock.ev.process(
    // events is a map for event name => event data
    async (events) => {
      // something about the connection changed
      // maybe it closed, or we received all offline message or connection opened
      if (events["connection.update"]) {
        const update = events["connection.update"];
        const { connection, lastDisconnect, qr } = update;
        if (qr?.length) {
          let qrcode = await toDataURL(qr);
          io.emit("qrcode", {
            token: number,
            data: qrcode,
            message: "Scan QR Code",
          });
        }

        if (connection === "open") {
          const device = await prisma.numbers.findFirst({
            where: { body: number },
          });
          await prisma.numbers.update({
            where: { id: device?.id },
            data: { status: "Connected" },
          });
          const [result] = await sock.onWhatsApp(sock.user?.id ?? "");
          const ppUrl = await sock.profilePictureUrl(result.jid, "image");
          io.emit("connection-open", {
            token: result.jid.replace(/\D/g, ""),
            user: { name: sock.user?.name, id: result.jid.replace(/\D/g, "") },
            ppUrl,
          });
        }
        if (connection === "close") {
          // reconnect if not logged out
          if ((lastDisconnect?.error as Boom)?.output.statusCode === 515) {
            connectToWhatsApp(`${number}`, io);
          }
          if (
            (lastDisconnect?.error as Boom)?.output?.statusCode !==
            DisconnectReason.loggedOut
          ) {
            // console.log(lastDisconnect?.error?.name)
            // connectToWhatsApp(`${number}`, io);            
          } else {
            fs.rmdirSync(`./${number}`, { recursive: true });
            connectToWhatsApp(`${number}`, io);
            const device = await prisma.numbers.findFirst({
              where: { body: number },
            });
            await prisma.numbers.update({
              where: { id: device?.id },
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
      if (events["messages.upsert"]) {
        const upsert = events["messages.upsert"];
        console.log("recv messages ", JSON.stringify(upsert, undefined, 2));
        if (upsert.type === "notify") {
          for (const msg of upsert.messages) {
            if (!msg.key.fromMe) {
              console.log("replying to", msg.key.remoteJid);
              await sock!.readMessages([msg.key]);
              // await sock.sendMessage(msg.key.remoteJid ?? '', {text: msg.message?.extendedTextMessage?.text ?? ''})
            }
          }
        }
      }
    }
  );

  sessions.set(number, sock)
}
