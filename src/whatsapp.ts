import makeWASocket, {
  DisconnectReason,
  type WAMessageContent,
  type WAMessageKey,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  makeInMemoryStore,
  useMultiFileAuthState,
  proto
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import NodeCache from "node-cache";
import MAIN_LOGGER from "./utils/logger";
import fs from 'fs'

const logger = MAIN_LOGGER.child({});
logger.level = "trace";

const msgRetryCounterCache = new NodeCache();

const store = makeInMemoryStore({ logger });
store?.readFromFile("./baileys_store_multi.json");

// save every 10s
setInterval(() => {
  store?.writeToFile("./baileys_store_multi.json");
}, 10_000);

export async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);

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
    getMessage,
  });

  store?.bind(sock.ev);

  sock.ev.process(
    // events is a map for event name => event data
    async (events) => {
      // something about the connection changed
      // maybe it closed, or we received all offline message or connection opened
      if (events["connection.update"]) {
        const update = events["connection.update"];
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
          // reconnect if not logged out
          if (
            (lastDisconnect?.error as Boom)?.output?.statusCode !==
            DisconnectReason.loggedOut
          ) {
            connectToWhatsApp();
          } else {    
            fs.rmdirSync('./auth_info',{recursive: true})   
            connectToWhatsApp()                               
            console.log("Connection closed. You are logged out.");
          }
        }

        console.log("connection update", update);
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

  return sock;

  async function getMessage(
    key: WAMessageKey
  ): Promise<WAMessageContent | undefined> {
    if (store) {
      const msg = await store.loadMessage(key.remoteJid!, key.id!);
      return msg?.message || undefined;
    }

    // only if store is present
    return proto.Message.fromObject({});
  }
}
