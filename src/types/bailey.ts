import type { proto, MessageUpsertType } from "@whiskeysockets/baileys";
export interface IUpsert {
  messages: proto.IWebMessageInfo[];
  type: MessageUpsertType;
}

