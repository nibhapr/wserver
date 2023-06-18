import express, { Application } from 'express';
import { connectToWhatsApp } from './whatsapp';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { WASocket } from '@whiskeysockets/baileys';
import bodyParser from 'body-parser';
import initSessions from './initSessions';
import routes from './routes';
import logger from './utils/logger';

type Session = WASocket;

export const sessions = new Map<string, Session>();
// Boot express
const app: Application = express();
const server = createServer(app);
export const io = new SocketServer(server, { cors: { origin: '*' } });
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false, limit: '50mb', parameterLimit: 100000 }));
app.use(bodyParser.json());
app.use('/', routes);

// Initialize All devices and set Sessions
initSessions();

io.on('connection', (socket) => {
  socket.on('StartConnection', (number: string) => {
    connectToWhatsApp(number, io); // init a particular device
  });
});

server.listen(port, () => logger.info(`Server is listening on port ${port}!`));
// Start server
