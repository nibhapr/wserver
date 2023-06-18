import { Request, RequestHandler } from "express";
import { sessions } from "..";
import { ISentText } from "../types/requestTypes";

export const sendText: RequestHandler = async (req: Request<{}, {}, ISentText>, res) => {
  const client = sessions.get(req.body.token);
  const result = await client?.onWhatsApp(req.body.number);
  await client?.sendMessage(result ? result[0].jid : "", {
    text: req.body.text ?? "",
  });
  res.status(200).json({ message: "sent!" });
};
