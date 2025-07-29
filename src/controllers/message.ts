import { Request, RequestHandler, Response } from "express";
import clients from "../utils/sessions";
import {
  IResponse,
  ISendBulk,
  ISentMedia,
  ISentText,
} from "../types/requestTypes";
import mime from "mime";
import { sendEachBlast } from "../services/message-service";
import { sendTextSchema } from "../schema/messageSchema";
import { Queue } from "bullmq";
import { redis } from "../utils/redis";
import { WhatsappJob } from "../types/job";
import { QUEUE_NAME } from "../utils/constants";

export const sendText: RequestHandler = async (
  req: Request<object, object, ISentText>,
  res: Response<IResponse>
) => {
  const validated = await sendTextSchema.safeParse(req.body);
  if (!validated.success) {
    res.status(400).json({
      message: "Invalid request",
      status: false,
      append: validated.error.format(),
    });
    return;
  }
  try {
    const queue = new Queue<WhatsappJob>(QUEUE_NAME, { connection: redis });
    await queue.add('send-message', {
      type: 'send-message',
      sender: req.body.token,
      receiver: req.body.number,
      message: req.body.text!,
    })
    res.status(200).json({
      message: "Message Sent!",
      status: true
    })
    //NOTE: Might want to handle some response here
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to send message",
      status: false,
    });
  }
};

export const sendMedia: RequestHandler = async (
  req: Request<object, object, ISentMedia>,
  res: Response<IResponse>
) => {
  const client = clients.get(req.body.token);
  const result = await client?.onWhatsApp(req.body.number);
  if (req.body.type === "pdf") {
    await client?.sendMessage(result ? result[0].jid : "", {
      document: { url: req.body.url ?? "" },
      mimetype: mime.getType(req.body.url ?? "") ?? "",
      caption: req.body.caption,
    });
  } else {
    await client?.sendMessage(result ? result[0].jid : "", {
      image: { url: req.body.url ?? "" },
      mimetype: mime.getType(req.body.url ?? "") ?? "", //mime.getType(req.body.url ?? "") ?? ""
      caption: req.body.caption,
    });
  }
  res.status(200).json({ message: "sent!", status: true });
};

export const sendBulk: RequestHandler = async (
  req: Request<object, object, ISendBulk>,
  res: Response<IResponse>
) => {
  const queue = new Queue(QUEUE_NAME, { connection: redis });
  const messages = req.body.data.map(e => e)
  await queue.addBulk(messages.map(message => ({
    name: 'send-message',
    data: message,
  })))
  res.status(200).json({
    status: true,
    message: "Messages are being sent in the background",
  })
};
