import axios from "axios";
import { sessions } from ".";
import { IUpsert } from "./types/bailey";
import prisma from "./utils/db";
import log from "./utils/logger";
import { sendBlast } from "./utils/message";
import { downloadMediaMessage } from "baileys";
import FormData from "form-data";
import { generate } from "qrcode-terminal";
import { generateGoodMorningMessage } from "./utils/common";

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

export const initTest = async (upsert: IUpsert, number: string) => {
  const client = sessions.get(number);
  if (!client) {
    console.error(`No client found for number: ${number}`);
    return;
  }
  upsert.messages.map(async (message) => {
    if (message.message?.imageMessage?.url?.length && !message.key.fromMe) {
      // Check if message is to a group
      if (message.key.remoteJid?.endsWith("@g.us")) {
        return
      }
      console.log("Image message received:", message.message.imageMessage.url);
      try {
        const buffer = await downloadMediaMessage(
          message,
          "buffer",
          {},
          { logger: log, reuploadRequest: client.updateMediaMessage }
        );
        const form = new FormData();

        form.append("file", buffer, {
          filename: "image.jpg",
          contentType: "image/jpeg",
        });
        // const res = await fetch("https://gm.milanpramod.online/predict", {
        //   method: "POST",
        //   headers: form.getHeaders(),
        //   body: form,
        // });
        const res = await axios.post(
          "https://gm.milanpramod.online/predict",
          form,
          {
            headers: form.getHeaders(),
          }
        );
        const data = await res.data
        console.log("Prediction result:", data.result, data.confidence);
        if (data?.result) {          
          sendBlast(
            client,
            message.key.remoteJid ?? "",
            {text: generateGoodMorningMessage()}.toString(),
            "text"
          );
        }
      } catch (error) {
        console.error("Error fetching prediction:", error);
      }
    }
  });
};

export default initAutoreply;
