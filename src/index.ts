import express, { Application, Request, Response, NextFunction } from "express";
import { connectToWhatsApp } from "./whatsapp";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import { prisma } from "./utils/db";
import bodyParser from "body-parser";
import type { WASocket } from "@whiskeysockets/baileys";

interface ISentText {
  token: string
  number: string
  text?: string
  type?: string
}

type Session = WASocket

export const sessions = new Map<string, Session>()
// Boot express
const app: Application = express();
const server = createServer(app);
const io = new SocketServer(server, {cors: {origin: '*'}});
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false,limit: '50mb',parameterLimit: 100000 }))
app.use(bodyParser.json())

const getDevices = async () => {
  const devices = await prisma.numbers.findMany()
  devices.forEach(device => {
    connectToWhatsApp(device.body, io)
  });
}

getDevices()

io.on("connection", (socket) => {         
  socket.on('StartConnection', (number: string) => {    
    connectToWhatsApp(number, io)
  })
});

app.post('/send-text', async (req: Request<{}, {}, ISentText>, res: Response) => {
  const client = sessions.get(req.body.token)
  const result = await client?.onWhatsApp(req.body.number)  
  await client?.sendMessage(result ? result[0].jid : '', {text: req.body.text ?? ''})
  console.log(req.body)
  res.status(200).json({message: 'sent!'})
}) 

server.listen(port, () => console.log(`Server is listening on port ${port}!`));

// Start server
