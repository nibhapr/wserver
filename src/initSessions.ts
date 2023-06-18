import { io } from '.';
import { prisma } from './utils/db';
import { connectToWhatsApp } from './whatsapp';

const initSessions = async () => {
  init();
  setInterval(async () => {
    init();
  }, 30000);
};

const init = async () => {
  const devices = await prisma.numbers.findMany();
  devices.forEach((device) => {
    connectToWhatsApp(device.body, io);
  });
};

export default initSessions;
