"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// Boot express
const app = (0, express_1.default)();
const port = 3000;
// Application routing
app.use('/', (req, res, next) => {
    res.status(200).json({ data: 'Hello from Express' });
});
// Start server
app.listen(port, () => console.log(`Server is listening on port ${port}!`));
