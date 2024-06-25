import { sessions } from ".";
import { IUpsert } from "./types/bailey";
import { prisma } from "./utils/db";
import { sendBlast } from "./utils/message";

const initAutoreply = async (upsert: IUpsert, number: string) => {
  const autoreplies = await prisma.autoreplies.findMany({
    where: { device: number },
  });
  const client = sessions.get(number);
  if (client) {
    autoreplies.map((autoreply) => {
      upsert.messages.map((message) => {
        if (
          (
            message.message?.extendedTextMessage?.text ??
            message.message?.conversation
          )?.toLowerCase() == autoreply.keyword.toLowerCase() &&
          !message.key.fromMe
        ) {
          sendBlast(
            client,
            message.key.remoteJid ?? "",
            autoreply.reply,
            autoreply.type
          );
        }
      });
    });
  }
};

export default initAutoreply;
