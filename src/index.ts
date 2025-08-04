import express, { Application, Request, Response } from "express";
import { LogoutDevice, connectToWhatsApp } from "./whatsapp";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import bodyParser from "body-parser";
import routes from "./routes";
import logger from "./utils/logger";
import { redisSubscriber } from "./utils/redis";

// Boot express
const app: Application = express();
const server = createServer(app);
export const io = new SocketServer(server, { cors: { origin: "*" } });
const port = 3000;
app.use(
  bodyParser.json({
    verify(
      req: Request & { rawBody?: string },
      _res: Response,
      buf: Buffer,
      encoding: BufferEncoding
    ) {
      if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || "utf-8");
      }
    },
  })
);
app.use("/", routes);

app.post("/delete-device", (_req: Request, res: Response) => {
  res.status(200).json({ message: "DELETED!" });
});

// initSessions();
const channel = `qr:919495722263`
redisSubscriber.subscribe(channel, (message) => {
  logger.info(`Received message from ${channel}: ${message}`);
})


io.on("connection", async (socket) => {
  logger.info("Socket Connected");

  socket.on("StartConnection", async (number: string) => {
    // connectToWhatsApp(number, socket); // init a particular device
    const channel = `qr:${number}`
    await redisSubscriber.subscribe(channel, (message) => {
      logger.info(`Received message from ${channel}: ${message}`);
    })
  });

  // socket.on("LogoutDevice", (number: string) => {
  //   LogoutDevice(number.toString(), socket);
  // });
});

server.listen(port, () => console.log(`Server is listening on port ${port}!`));
// Start server
