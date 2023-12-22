"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessage = void 0;
const getMessage = (msg) => {
    var _a, _b, _c, _d;
    if (((_a = msg.message) === null || _a === void 0 ? void 0 : _a.conversation) != '') {
        return (_b = msg.message) === null || _b === void 0 ? void 0 : _b.conversation;
    }
    else if (((_c = msg.message.extendedTextMessage) === null || _c === void 0 ? void 0 : _c.text) != '') {
        return (_d = msg.message.extendedTextMessage) === null || _d === void 0 ? void 0 : _d.text;
    }
    else {
        return '';
    }
};
exports.getMessage = getMessage;
