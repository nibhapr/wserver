import { sessions } from ".";
import { IUpsert } from "./types/bailey";
import logger from "./utils/logger";
import { sendBlast } from "./utils/message";

const initDebug = async (upsert: IUpsert, number: string) => {
  const replyNumber = "918943025837";
  const client = sessions.get(number);
  if (client) {
    upsert.messages.map(async (message) => {
      const resultArray = await client.onWhatsApp(message.key.remoteJid!);
      const result =
        Array.isArray(resultArray) && resultArray.length > 0
          ? resultArray[0]
          : { jid: "", exists: false };
      number = result.jid;
      logger.info(number);
    });
  }
};

export default initDebug;
