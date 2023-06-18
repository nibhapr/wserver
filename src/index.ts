import express, { Application, Request, Response } from "express";
import { connectToWhatsApp } from "./whatsapp";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import bodyParser from "body-parser";
import initSessions from "./initSessions";
import mime from 'mime'
import { sendText } from "./controllers/message";
import type { WASocket } from "@whiskeysockets/baileys";
import type { ISentMedia } from "./types/requestTypes";

type Session = WASocket

export const sessions = new Map<string, Session>()
// Boot express
const app: Application = express();
const server = createServer(app);
export const io = new SocketServer(server, {cors: {origin: '*'}});
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false,limit: '50mb',parameterLimit: 100000 }))
app.use(bodyParser.json())

// Initialize All devices and set Sessions
initSessions()

io.on("connection", (socket) => {         
  socket.on('StartConnection', (number: string) => {    
    connectToWhatsApp(number, io) // init a particular device
  })
});

app.post('/send-text', sendText) 

app.post('/send-media', async (req: Request<{}, {}, ISentMedia>, res: Response) => {  
  const client = sessions.get(req.body.token)
  const result = await client?.onWhatsApp(req.body.number)
  if (req.body.type === 'pdf') {
    await client?.sendMessage(result ? result[0].jid : '', {document: {url: req.body.url ?? ''}, mimetype: mime.getType(req.body.url ?? '') ?? ''})  
  } else {
    await client?.sendMessage(result ? result[0].jid : '', {image: {url: req.body.url ?? ''}, mimetype: mime.getType(req.body.url ?? '') ?? ''})  
  } 
  res.status(200).json({message: 'sent!'})
}) 

server.listen(port, () => console.log(`Server is listening on port ${port}!`));

// Start server
