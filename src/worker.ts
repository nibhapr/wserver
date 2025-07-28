import { Worker } from 'bullmq';
import { redis } from './utils/redis';
import NodeCache from 'node-cache';
import { startWhatsAppSession } from './lib/whatsapp';
import logger from './utils/logger';

export const sessions = new Map();
export const msgRetryCounterCache = new NodeCache();


new Worker('whatsapp-jobs', async (job) => {
  logger.info(`Processing job: ${job.name} for session: ${job.data.number}`);
  switch (job.name) {
    case 'connect-whatsapp':
      await startWhatsAppSession(job.data.number);
      break;

    case 'send-message':
      const { number, to, text } = job.data;
      const sock = sessions.get(number);

      if (sock) {
        try {
          console.log(`Sending message to ${to} from session ${number}`);
          //TODO: Good place to add delay
          await sock.sendMessage(`${to}@s.whatsapp.net`, { text });
        } catch (error) {
          console.error('Failed to send message:', error);
          throw error; // Fail the job so it can be retried
        }
      } else {
        //TODO:: Handle case where session is not found (Message not sent)
        console.error(`Session ${number} not found. Cannot send message.`);
        throw new Error(`Session ${number} not found. Cannot send message.`);
      }
      break;
  }
}, { connection: redis });
