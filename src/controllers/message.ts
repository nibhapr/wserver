import { Request, RequestHandler, Response } from "express";
import { sessions } from "..";
import {
  IResponse,
  ISendBulk,
  ISentMedia,
  ISentText,
} from "../types/requestTypes";
import mime from "mime";
import { sendEachBlast } from "../services/message-service";

export const sendText: RequestHandler = async (
  req: Request<object, object, ISentText>,
  res: Response<IResponse>
) => {
  const client = sessions.get(req.body.token);
  const result = await client?.onWhatsApp(req.body.number);
  await client?.sendMessage(result ? result[0].jid : "", {
    text: req.body.text ?? "",
  });
  res.status(200).json({ message: "sent!", status: true });
};

export const sendMedia: RequestHandler = async (
  req: Request<object, object, ISentMedia>,
  res: Response<IResponse>
) => {
  const client = sessions.get(req.body.token);
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
      mimetype: mime.getType(req.body.url ?? "") ?? "",
      caption: req.body.caption,
    });
  }
  res.status(200).json({ message: "sent!", status: true });
};

export const sendBulk: RequestHandler = async (
  req: Request<object, object, ISendBulk>,
  res: Response<IResponse>
) => {
  const client = sessions.get(req.body.data[0].sender);
  if (client) {
    await sendEachBlast(req.body.data, req.body.delay, client);
    res.status(200).json({ status: true, message: "Messages sent!" });
  } else {
    res
      .status(404)
      .json({ message: "Whatsapp session not found!", status: false });
  }
};
