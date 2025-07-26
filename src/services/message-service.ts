import { WASocket } from "baileys";
import prisma from "../utils/db";
import { blasts } from "@prisma/client";
import { sendBlast } from "../utils/message";
import { blastQueue } from "../utils/redis";
export const sendEachBlast = async (
  blasts: blasts[],
  delay: number,
  client: WASocket
) => {
  for (const blast of blasts) {
    await blastQueue.add('send-blast', { blastId: blast.id, client: blast.sender })
    // const result = await sendBlast(
    //   client,
    //   blast.receiver,
    //   blast.message,
    //   blast.type
    // );
    //
    // if (result) {
    //   await prisma.blasts.update({
    //     where: { id: blast.id },
    //     data: {
    //       status: "success",
    //       updated_at: new Date(),
    //     },
    //   });
    // } else {
    //   await prisma.blasts.update({
    //     where: { id: blast.id },
    //     data: {
    //       status: "failed",
    //       updated_at: new Date(),
    //     },
    //   });
    // }
  }
};
