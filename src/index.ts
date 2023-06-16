import express, { Application, Request, Response, NextFunction } from "express";
import { connectToWhatsApp } from "./whatsapp";
import { startSock } from "./example";
// Boot express
const app: Application = express();
const port = 3000;

// Application routing
app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({ data: "Hello from Express with Typescript!" });
});

connectToWhatsApp().then((client) => {
  client.ev.on("messages.upsert", (msg) => {
    console.log(msg.messages[0].key.remoteJid);
  });
  app.get("/send", (_req: Request, res: Response) => {
    client.sendMessage("917902708908@s.whatsapp.net", { text: "HELLO WORLD!" });
    res.status(200).json({message: 'Message Sent!'})
  });
  app.listen(port, () => console.log(`Server is listening on port ${port}!`));
});

// Start server
