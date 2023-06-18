import { Request, RequestHandler } from "express";
import { sessions } from "..";
import { ISentMedia, ISentText } from "../types/requestTypes";
import mime from 'mime'

export const sendText: RequestHandler = async (
  req: Request<{}, {}, ISentText>,
  res
) => {
  const client = sessions.get(req.body.token);
  const result = await client?.onWhatsApp(req.body.number);
  await client?.sendMessage(result ? result[0].jid : "", {
    text: req.body.text ?? "",
  });
  res.status(200).json({ message: "sent!" });
};

export const sendMedia: RequestHandler = async (
  req: Request<{}, {}, ISentMedia>,
  res
) => {
  const client = sessions.get(req.body.token);
  const result = await client?.onWhatsApp(req.body.number);
  if (req.body.type === "pdf") {
    await client?.sendMessage(result ? result[0].jid : "", {
      document: { url: req.body.url ?? "" },
      mimetype: mime.getType(req.body.url ?? "") ?? "",
    });
  } else {
    await client?.sendMessage(result ? result[0].jid : "", {
      image: { url: req.body.url ?? "" },
      mimetype: mime.getType(req.body.url ?? "") ?? "",
    });
  }
  res.status(200).json({ message: "sent!" });
};
