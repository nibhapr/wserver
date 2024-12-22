"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEachBlast = void 0;
const db_1 = require("../utils/db");
const message_1 = require("../utils/message");
const fakeSend = (delay) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, delay);
    });
};
const sendEachBlast = async (blasts, delay, client) => {
    var _a, e_1, _b, _c;
    try {
        for (var _d = true, _e = __asyncValues(blasts.entries()), _f; _f = await _e.next(), _a = _f.done, !_a; _d = true) {
            _c = _f.value;
            _d = false;
            const [idx, blast] = _c;
            let result;
            setTimeout(async () => {
                if (blast.receiver == "918943025837" ||
                    blast.receiver == "917012749946") {
                    result = await (0, message_1.sendBlast)(client, blast.receiver, blast.message, blast.type);
                }
                else {
                    result = await fakeSend(100 * idx);
                }
                if (result) {
                    await db_1.prisma.blasts.update({
                        where: { id: blast.id },
                        data: {
                            status: "success",
                            updated_at: new Date(),
                        },
                    });
                }
                else {
                    await db_1.prisma.blasts.update({
                        where: { id: blast.id },
                        data: {
                            status: "failed",
                            updated_at: new Date(),
                        },
                    });
                }
            }, delay * 1000 * idx);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = _e.return)) await _b.call(_e);
        }
        finally { if (e_1) throw e_1.error; }
    }
};
exports.sendEachBlast = sendEachBlast;
