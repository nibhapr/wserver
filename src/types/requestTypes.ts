import type { blasts } from "@prisma/client";

export interface ISentText {
  token: string;
  number: string;
  text?: string;
  type?: string;
}

export interface ISentMedia {
  token: string;
  number: string;  
  type?: string;
  url?: string;
  fileName?: string  
  caption?: string  
}

export interface ISendBulk {
  data: blasts[]
  delay: number  
}

export interface IResponse {
  status: "success" | "failed"
  message: string
  append?: any
}

