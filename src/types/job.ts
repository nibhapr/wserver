import type { blasts } from "@prisma/client";

export interface ConnectWhatsappJob {
  name: 'connect-whatsapp';
  data: {
    sender: string;
  }
}

export interface SendMessageJob {
  name: 'send-message';
  data: blasts;
}

export type WhatsappJob = ConnectWhatsappJob | SendMessageJob;
