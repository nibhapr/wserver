import { WASocket } from "baileys";
import { prisma } from "../utils/db";
import { blasts } from "@prisma/client";
import { sendBlast } from "../utils/message";

export const sendEachBlast = async (
  blasts: blasts[],
  delay: number,
  client: WASocket
) => {
  for (const [idx, blast] of blasts.entries()) {
    await new Promise((resolve) => setTimeout(resolve, delay * 1000 * idx));

    const result = await sendBlast(
      client,
      blast.receiver,
      blast.message,
      blast.type
    );

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
  }
};
