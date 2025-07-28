import { Job, Queue, Worker } from 'bullmq';
import { redis } from './utils/redis';
import type { WhatsappJob } from './types/job'
import NodeCache from 'node-cache';
import { startWhatsAppSession } from './lib/whatsapp';
import logger from './utils/logger';
import prisma from './utils/db';
import { sleep } from './utils/common';
import { blasts } from '@prisma/client';
export const sessions = new Map();
export const msgRetryCounterCache = new NodeCache();

new Worker<WhatsappJob["data"], any, WhatsappJob['name']>('whatsapp-jobs', async (job: Job<WhatsappJob['data'], any, WhatsappJob['name']>) => {
  logger.info(`Processing job: ${job.name} for session: ${job.data.sender}`);
  switch (job.name) {
    case 'connect-whatsapp':
      await startWhatsAppSession(job.data.sender);
      break;

    case 'send-message':
      const { sender, receiver, message } = job.data
      const sock = sessions.get(sender);
      if (sock) {
        try {
          console.log(`Sending message to ${receiver} from session ${sender}`);
          //TODO: Good place to add delay
          const randomDelay = Math.floor(Math.random() * 1000) + 500; // Random delay between 500ms and 1500ms
          await sleep(randomDelay);
          // await sock.sendMessage(`${to}@s.whatsapp.net`, { text });
          const result = await sock.onWhatsApp(receiver);
          const response = await sock.sendMessage(result ? result[0].jid : "", {
            text: message,
          });
          console.log(sock, result);
        } catch (error) {
          console.error('Failed to send message:', error);
          throw error; // Fail the job so it can be retried
        }
      } else {
        //TODO:: Handle case where session is not found (Message not sent)
        console.error(`Session ${sender} not found. Cannot send message.`);
        throw new Error(`Session ${sender} not found. Cannot send message.`);
      }
      break;
  }
}, { connection: redis });

async function initializeWorker() {
  logger.info('WhatsApp worker initialized');
  const queue = new Queue('whatsapp-jobs', {
    connection: redis,
  })
  const numbers = await prisma.numbers.findMany();
  numbers.forEach(number => {
    queue.add('connect-whatsapp', { number: number.body }, {
      delay: 1000, // Delay to avoid overwhelming the WhatsApp API
      attempts: 1,
    });
  })
}


initializeWorker()
