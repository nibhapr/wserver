import prisma from "./utils/db";
import log from "./utils/logger";
import { initializeWhatsapp } from "./whatsapp";

const initSessions = async () => {
  init();
  setInterval(async () => {
    init();
  }, 900000);
};

const init = async () => {
  const devices = await prisma.numbers.findMany();
  log.info(`Initializing ${devices.length} devices...`);
  devices.forEach((device) => {
    if (device.status === "Connected") {
      return; // Skip already connected devices
    }
    initializeWhatsapp(device.body);
  });
};



export default initSessions;
