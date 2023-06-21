import type { blasts_type } from "@prisma/client";
import type {
  AnyMediaMessageContent,
  AnyMessageContent,
  WASocket,
} from "@whiskeysockets/baileys";
import mime from "mime";

type Message = {
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
  type: blasts_type
) => {
  const [result] = await client?.onWhatsApp(receiver);
  const msg: Message = JSON.parse(message);
  if (type === "text") {
    await client?.sendMessage(result.jid, {
      text: msg.text ?? "",
    });
  } else if (type === "image") {
    await client.sendMessage(result.jid, {
      caption: msg.caption ?? "",
      image: { url: msg.image?.url ?? "" },
      mimetype: mime.getType(msg.image?.url ?? "") ?? "",
    });
  }
};
