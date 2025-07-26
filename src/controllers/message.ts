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
    const client = clients.get(req.body.token);
    const result = await client?.onWhatsApp(req.body.number);
    const response = await client?.sendMessage(result ? result[0].jid : "", {
      text: req.body.text ?? "",
    });
    console.log(client, result);
    if (response) {
      res.status(200).json({ message: "sent!", status: true });
    } else {
      res.status(500).json({
        message: "Failed to send message",
        status: false,
      });
    }
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
  const client = clients.get(req.body.data[0].sender);
  if (client) {
    await sendEachBlast(req.body.data, req.body.delay, client);
    res.status(200).json({ status: true, message: "Messages sent!" });
  } else {
    res
      .status(404)
      .json({ message: "Whatsapp session not found!", status: false });
  }
};
