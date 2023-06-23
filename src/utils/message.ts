import type { autoreplies_type, blasts_type } from "@prisma/client";
import type { WASocket } from "@whiskeysockets/baileys";
import mime from "mime";
import logger from "./logger";

export type IMessage = {
  text?: string;
  caption?: string;
  image?: {
    url: string;
  };
};

export const sendBlast = async (
  client: WASocket,
  receiver: string,
  message: string,
  type: blasts_type | autoreplies_type
) => {

  //Get the JID if receiver is just number or not
  let number = "";
  if (/[^0-9]/g.test(receiver)) {
    number = receiver;
  } else {
    const [result] = await client?.onWhatsApp(receiver);
    number = result.jid;
  }

  const msg: IMessage = JSON.parse(message);
  if (type === "text") {
    await client?.sendMessage(number, {
      text: msg.text ?? "",
    });
  } else if (type === "image") {
    await client.sendMessage(number, {
      caption: msg.caption ?? "",
      image: { url: msg.image?.url ?? "" },
      mimetype: mime.getType(msg.image?.url ?? "") ?? "",
    });
  }
};
