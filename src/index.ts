import express, { Application, Request, Response } from "express";
import { LogoutDevice, connectToWhatsApp } from "./whatsapp";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import { WASocket } from "@whiskeysockets/baileys";
import bodyParser from "body-parser";
import initSessions from "./initSessions";
import routes from "./routes";
import logger from "./utils/logger";

type Session = WASocket

export const sessions = new Map<string, Session>()

// Boot express
const app: Application = express();
const server = createServer(app);
export const io = new SocketServer(server, {cors: {origin: '*'}});
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false,limit: '50mb',parameterLimit: 100000 }))
app.use(bodyParser.json())
app.use('/', routes)
app.post('/delete-device', (_req: Request, res: Response) => {
  res.status(200).json({message: 'DELETED!'})
})

// initSessions()

io.on("connection", (socket) => {           
  logger.info(socket.id)
  // Initialize All devices and set Sessions
  socket.on('StartConnection', (number: string) => {    
    connectToWhatsApp(number, socket) // init a particular device
  })

  socket.on("LogoutDevice", (number: string) => {
    LogoutDevice(number.toString(), socket)
  })
});



server.listen(port, () => console.log(`Server is listening on port ${port}!`));
// Start server

