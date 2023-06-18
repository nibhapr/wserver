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
  fileName?: string;
  caption?: string;
}
