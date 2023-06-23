import initAutoreply from "./autoreply";
import { prisma } from "./utils/db";
import { initializeWhatsapp } from "./whatsapp";

const initSessions = async () => {
  init();  
  setInterval(async () => {
    init();
  }, 900000);
};

const init = async () => {
  const devices = await prisma.numbers.findMany();
  devices.forEach((device) => {
    initializeWhatsapp(device.body)
  });  
};

export default initSessions;
