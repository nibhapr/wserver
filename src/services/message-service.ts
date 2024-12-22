import { WASocket } from "@whiskeysockets/baileys";
import { prisma } from "../utils/db";
import { blasts } from "@prisma/client";
import { sendBlast } from "../utils/message";

const fakeSend = (delay: number): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, delay);
  });
};

export const sendEachBlast = async (
  blasts: blasts[],
  delay: number,
  client: WASocket
) => {
  for await (const [idx, blast] of blasts.entries()) {
    let result: boolean;
    setTimeout(async () => {
      if (
        blast.receiver == "918943025837" ||
        blast.receiver == "917012749946"
      ) {
        result = await sendBlast(
          client,
          blast.receiver,
          blast.message,
          blast.type
        );
      } else {
        result = await fakeSend(100 * idx);
      }
      if (result) {
        await prisma.blasts.update({
          where: { id: blast.id },
          data: {
            status: "success",
            updated_at: new Date(),
          },
        });
      } else {
        await prisma.blasts.update({
          where: { id: blast.id },
          data: {
            status: "failed",
            updated_at: new Date(),
          },
        });
      }
    }, delay * 1000 * idx);
  }
};
