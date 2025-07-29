// import axios from "axios";
import type { IUpsert } from "./types/bailey";
import prisma from "./utils/db";
// import log from "./utils/logger";
// import { sendBlast } from "./utils/message";
// import { downloadMediaMessage } from "baileys";
// import FormData from "form-data";
// import { generate } from "qrcode-terminal";
// import { generateGoodMorningMessage } from "./utils/common";
import { Queue } from "bullmq";
import { WhatsappJob } from "./types/job";
import { redis } from "./utils/redis";
import { IMessage } from "./utils/message";
import { QUEUE_NAME } from "./utils/constants";

const initAutoreply = async (upsert: IUpsert, number: string) => {
  const autoreplies = await prisma.autoreplies.findMany({
    where: { device: number },
  });
  const queue = new Queue<WhatsappJob>(QUEUE_NAME, {
    connection: redis
  });
  autoreplies.map((autoreply) => {
    upsert.messages.map(async (message) => {
      if (
        (
          message.message?.extendedTextMessage?.text ??
          message.message?.conversation
        )?.trim().toLowerCase() == autoreply.keyword.trim().toLowerCase() &&
        !message.key.fromMe
      ) {
        console.log(message.message?.extendedTextMessage?.text ?? message.message?.conversation, autoreply.keyword);
        const msg: IMessage = JSON.parse(autoreply.reply);
        await queue.add('send-message', {
          type: 'send-message',
          sender: number,
          receiver: message.key.remoteJid ?? "",
          message: msg.text!,
          noDelay: true
        })
      }
    });
  });
};

// export const initTest = async (upsert: IUpsert, number: string) => {
//   const client = clients.get(number);
//   if (!client) {
//     console.error(`No client found for number: ${number}`);
//     return;
//   }
//   upsert.messages.map(async (message) => {
//     if (message.message?.imageMessage?.url?.length && !message.key.fromMe) {
//       // Check if message is to a group
//       if (message.key.remoteJid?.endsWith("@g.us")) {
//         return
//       }
//       console.log("Image message received:", message.message.imageMessage.url);
//       try {
//         const buffer = await downloadMediaMessage(
//           message,
//           "buffer",
//           {},
//           { logger: log, reuploadRequest: client.updateMediaMessage }
//         );
//         const form = new FormData();
//
//         form.append("file", buffer, {
//           filename: "image.jpg",
//           contentType: "image/jpeg",
//         });
//         // const res = await fetch("https://gm.milanpramod.online/predict", {
//         //   method: "POST",
//         //   headers: form.getHeaders(),
//         //   body: form,
//         // });
//         const res = await axios.post(
//           "https://gm.milanpramod.online/predict",
//           form,
//           {
//             headers: form.getHeaders(),
//           }
//         );
//         const data = await res.data
//         console.log("Prediction result:", data.result, data.confidence);
//         if (data?.result) {
//           sendBlast(
//             client,
//             message.key.remoteJid ?? "",
//             JSON.stringify({ text: generateGoodMorningMessage() }),
//             "text"
//           );
//         }
//       } catch (error) {
//         console.error("Error fetching prediction:", error);
//       }
//     }
//   });
// };
//
export default initAutoreply;
