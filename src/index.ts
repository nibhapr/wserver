import express, { Application, Request, Response } from "express";
import { IncomingMessage } from "http";
import { LogoutDevice, connectToWhatsApp } from "./whatsapp";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import { WASocket } from "@whiskeysockets/baileys";
import bodyParser from "body-parser";
import initSessions from "./initSessions";
import routes from "./routes";
import apiRoutes from "./routes/webhook";
import logger from "./utils/logger";

type Session = WASocket

export const sessions = new Map<string, Session>()

// Boot express
const app: Application = express();
const server = createServer(app);
export const io = new SocketServer(server, {cors: {origin: '*'}});
const port = 3000;
app.use(bodyParser.json({
  verify(req: Request & { rawBody?: string }, _res: Response, buf: Buffer, encoding: BufferEncoding) {
    if (buf && buf.length) {
      req.rawBody = buf.toString(encoding || 'utf-8')
    }
  },
}))
app.use('/', routes)
app.use('/api', apiRoutes)

app.post('/delete-device', (_req: Request, res: Response) => {
  res.status(200).json({message: 'DELETED!'})
})

initSessions()

io.on("connection", (socket) => {           
  // Initialize All devices and set Sessions
  logger.info('Socket Connected')
  socket.on('StartConnection', (number: string) => {    
    connectToWhatsApp(number, socket) // init a particular device
  })

  socket.on("LogoutDevice", (number: string) => {
    LogoutDevice(number.toString(), socket)
  })
});



server.listen(port, () => console.log(`Server is listening on port ${port}!`));
// Start server

