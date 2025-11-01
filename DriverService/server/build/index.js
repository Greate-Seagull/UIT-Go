"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./src/app"));
const PORT = 3000;
app_1.default.listen(PORT, (error) => {
    if (error)
        throw error;
    console.log(`Listening to http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map