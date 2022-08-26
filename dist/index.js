"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = __importDefault(require("discord.js"));
const allIntents = {
    intents: new discord_js_1.default.Intents(32767),
};
const client = new discord_js_1.default.Client(allIntents);
client.login("OTQ5NTY5MjA4OTE0Njc3Nzkw.YiMRPQ.o0zj7lxuQ7ABkP1o5c5uTW8IOYw");
