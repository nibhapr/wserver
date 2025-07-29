import makeWASocket, { DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } from "baileys";
import qrcode from 'qrcode-terminal';
import { deleteSessionFromRedis, useRedisAuthState } from "../auth/redis-auth";
import { redis } from "../utils/redis";
import { msgRetryCounterCache, sessions } from "../worker";
import logger from "../utils/logger";
import { Boom } from "@hapi/boom";
import initAutoreply from "../autoreply";

export async function startWhatsAppSession(number: string) {
  logger.info(`Starting WhatsApp session for: ${number}`);
  if (sessions.has(number)) {
    logger.info(`Session for ${number} already exists.`);
    return sessions.get(number);
  }
  logger.info(`Starting new Baileys session: ${number}`);
  const { state, saveCreds } = await useRedisAuthState(redis, `${number}`);
  const { version, isLatest } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version,
    logger,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    markOnlineOnConnect: false,
    msgRetryCounterCache,
    generateHighQualityLinkPreview: true,
  });
  sessions.set(number, sock);
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      qrcode.generate(qr, { small: true }, (qrcode) => {
        console.log(qrcode);
      });
    }
    switch (connection) {
      case 'close':
        const statusCode = (lastDisconnect?.error as Boom)?.output.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        sessions.delete(number);
        if ((lastDisconnect?.error as Boom)?.output?.statusCode === DisconnectReason.restartRequired) {
          startWhatsAppSession(number);
        }
        if (statusCode === DisconnectReason.loggedOut) {
          await deleteSessionFromRedis(redis, `${number}`);
        }
        break;
      case 'connecting':
        break;
      case 'open':
        break;
    }
  });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('messages.upsert', async (m) => {
    initAutoreply(m, number)
  })
  return sock;
}

