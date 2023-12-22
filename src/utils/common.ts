import { proto } from "@whiskeysockets/baileys"
export const getMessage = (msg: proto.IWebMessageInfo) => {
    if (msg.message?.conversation != '') {
        return msg.message?.conversation;
    } else if (msg.message.extendedTextMessage?.text != '') {
        return msg.message.extendedTextMessage?.text;
    } else {
        return '';
    }
}