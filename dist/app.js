"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const client_1 = require("react-dom/client");
const HomeComponent_1 = __importDefault(require("./components/HomeComponent"));
const root = (0, client_1.createRoot)(document.body);
root.render((0, jsx_runtime_1.jsx)(HomeComponent_1.default, { Loading: false }));
//# sourceMappingURL=app.js.map