import type { proto, MessageUpsertType } from "baileys";
export interface IUpsert {
  messages: proto.IWebMessageInfo[];
  type: MessageUpsertType;
}
