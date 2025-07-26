// file: ./worker.ts
import { Worker } from 'bullmq';
import prisma from './utils/db';
import { sendBlast } from './utils/message';
import clients from './utils/sessions';
import { WASocket } from 'baileys';
import { redis } from './utils/redis';

const worker = new Worker('blast-queue', async job => {
  const { blastId } = job.data;

  // Fetch the latest blast data from the DB
  const blast = await prisma.blasts.findUnique({ where: { id: blastId } });

  if (!blast) {
    console.error(`Blast with ID ${blastId} not found.`);
    return;
  }

  // Use a try...catch block for robust error handling
  try {
    const client = clients.get(blast.sender) as WASocket;
    const result = await sendBlast(client, blast.receiver, blast.message, blast.type);

    if (result) {
      await prisma.blasts.update({
        where: { id: blast.id },
        data: { status: 'success', updated_at: new Date() },
      });
      console.log(`Successfully sent message to ${blast.receiver}`);
    } else {
      // This 'else' handles cases where sendBlast resolves but indicates failure
      throw new Error('sendBlast returned a falsy result');
    }
  } catch (error) {
    console.error(`Failed to send message to ${blast.receiver}:`, error);
    await prisma.blasts.update({
      where: { id: blast.id },
      data: { status: 'failed', updated_at: new Date() },
    });
  }
}, {
  connection: redis,
  // BullMQ has built-in rate limiting, which is better than setTimeout
  limiter: {
    max: 1, // Max 1 job
    duration: 500, // per 5000 milliseconds (5 seconds)
  },
});

console.log('Worker is listening for jobs...');
