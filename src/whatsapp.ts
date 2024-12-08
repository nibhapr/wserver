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
import type { Socket } from "socket.io";
import { toDataURL } from "qrcode";
import { prisma } from "./utils/db";
import { sessions } from ".";
import initAutoreply from "./autoreply";
import initDebug from "./initDebug";

const logger = MAIN_LOGGER.child({});
logger.level = "info";

const msgRetryCounterCache = new NodeCache();

// const store = makeInMemoryStore({ logger });
// store?.readFromFile("./baileys_store_multi.json");

// save every 10s
// setInterval(() => {
//   store?.writeToFile("./baileys_store_multi.json");
// }, 10_000);

export async function LogoutDevice(number: string, io: Socket) {
  const session = sessions.get(number);
  await session?.logout();
  const device = await prisma.numbers.findFirst({
    where: { body: number },
  });

  if (device?.status === "Connected") {
    await prisma.numbers.update({
      where: { id: device.id },
      data: { status: "Disconnect" },
    });
  }
  if (fs.existsSync(`./${number}`)) {
    fs.rmdirSync(`./${number}`, { recursive: true });
  }
  sessions.delete(number);
  connectToWhatsApp(number, io);
}

export async function connectToWhatsApp(number: string, io: Socket) {
  logger.info("CONNECT TO WHATSAPP");
  const { state, saveCreds } = await useMultiFileAuthState(`${number}`);
  const { version, isLatest } = await fetchLatestBaileysVersion();
  logger.info(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
  const sock = makeWASocket({
    // can provide additional config here
    version,
    logger,
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
        const device = await prisma.numbers.findFirst({
          where: { body: number },
        });
        const update = events["connection.update"];
        const { connection, lastDisconnect, qr } = update;
        if (qr?.length) {
          logger.warn("QRCODE");
          if (
            (device?.status === "Connected" &&
              update.connection === "connecting") ||
            (device?.status === "Connected" && update.connection === "close")
          ) {
            await prisma.numbers.update({
              where: { id: device.id },
              data: { status: "Disconnect" },
            });
          }
          const qrcode = await toDataURL(qr);
          io.emit("qrcode", {
            token: number,
            data: qrcode,
            message: "Scan QR Code",
          });
        }

        if (connection === "open") {
          const connectedDevice = sock.user;
          const connectedNumber = connectedDevice?.id
            .split(":")[0]
            .replace(/\D/g, "");
          await prisma.numbers.update({
            where: { id: device?.id },
            data: { status: "Connected" },
          });
       
          if (connectedNumber != number.toString()) {
            io.emit("number-mismatch");
            await sock.logout();
          } else {
            logger.info("EMITTING CONNECTION OPEN");
            io.emit("connection-open", {
              token: connectedNumber,
              user: {
                name: connectedDevice?.name,
                id: connectedNumber,
              },
              ppUrl:  await sock.profilePictureUrl(sock.user?.id ?? "")
            });
          }
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
            if (device?.status === "Connected") {
              await prisma.numbers.update({
                where: { id: device.id },
                data: { status: "Disconnect" },
              });
            }
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

      //Initialize autoreplies
      if (events["messages.upsert"]) {
        const upsert = events["messages.upsert"];
        initAutoreply(upsert, number);
        initDebug(upsert, number);
      }
    }
  );

  sessions.set(number, sock);
}

export const initializeWhatsapp = async (number: string) => {
  logger.info("INTITIALIZE WHATSAPP");
  const { state, saveCreds } = await useMultiFileAuthState(`${number}`);
  const { version, isLatest } = await fetchLatestBaileysVersion();
  logger.info(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
  const sock = makeWASocket({
    // can provide additional config here
    logger,
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
        const connectedDevice = sock.user?.id.split(":")[0].replace(/\D/g, "");
        logger.info(`Connected to ${connectedDevice}`);
        const device = await prisma.numbers.findFirst({
          where: { body: number },
        });
        const update = events["connection.update"];
        const { connection, lastDisconnect, qr, legacy } = update;
        if (qr?.length) {
          logger.warn("QRCODE");
          if (
            (device?.status === "Connected" &&
              update.connection === "connecting") ||
            (device?.status === "Connected" && update.connection === "close")
          ) {
            await prisma.numbers.update({
              where: { id: device.id },
              data: { status: "Disconnect" },
            });
          }
        }

        if (connection === "open") {
          await prisma.numbers.update({
            where: { id: device?.id },
            data: { status: "Connected" },
          });
        }
        if (connection === "close") {
          // reconnect if not logged out
          if ((lastDisconnect?.error as Boom)?.output.statusCode === 515) {
            initializeWhatsapp(number);
          }
          if (
            (lastDisconnect?.error as Boom)?.output?.statusCode !==
            DisconnectReason.loggedOut
          ) {
            if (device?.status === "Connected") {
              await prisma.numbers.update({
                where: { id: device.id },
                data: { status: "Disconnect" },
              });
            }
            // console.log(lastDisconnect?.error?.name)
            // connectToWhatsApp(`${number}`, io);
          } else {
            fs.rmdirSync(`./${number}`, { recursive: true });
            initializeWhatsapp(number);
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

      //Initialize autoreplies
      if (events["messages.upsert"]) {
        const upsert = events["messages.upsert"];
        initAutoreply(upsert, number);
        // initDebug(upsert, number);
      }
    }
  );

  sessions.set(number, sock);
};
