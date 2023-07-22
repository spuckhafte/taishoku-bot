"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = __importStar(require("discord.js"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const manager_js_1 = __importDefault(require("./manager.js"));
const updateDb_js_1 = __importDefault(require("./helpers/updateDb.js"));
const registerAll_js_1 = require("./helpers/registerAll.js");
const ramenVote_js_1 = __importDefault(require("./helpers/ramenVote.js"));
const manageChat_js_1 = __importDefault(require("./helpers/manageChat.js"));
const User_js_1 = __importDefault(require("./schema/User.js"));
dotenv_1.default.config();
const Commando = new manager_js_1.default('commands', 'js');
const OtherInteractions = new manager_js_1.default('interactions', 'js');
const { socket, processVote } = (0, ramenVote_js_1.default)();
mongoose_1.default.set("strictQuery", false);
mongoose_1.default.connect((_a = process.env.DB) !== null && _a !== void 0 ? _a : "", (e) => console.log(e ? e : '[connected to db]'));
const client = new discord_js_1.default.Client({
    intents: [
        discord_js_1.Intents.FLAGS.GUILDS,
        discord_js_1.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        discord_js_1.Intents.FLAGS.GUILD_MEMBERS,
        discord_js_1.Intents.FLAGS.GUILD_MESSAGES,
        discord_js_1.Intents.FLAGS.MESSAGE_CONTENT
    ]
});
client.on('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    console.log(`[logged in as ${(_b = client.user) === null || _b === void 0 ? void 0 : _b.username}]`);
}));
client.on('interactionCreate', (Interaction) => __awaiter(void 0, void 0, void 0, function* () {
    if (Interaction.isCommand()) {
        let cmdName = Interaction.commandName;
        Commando.run(cmdName, { Interaction });
    }
    if (Interaction.isSelectMenu()) {
        const menuId = Interaction.customId;
        OtherInteractions.run(menuId, { Interaction });
    }
    if (Interaction.isModalSubmit()) {
        const modalId = Interaction.customId;
        OtherInteractions.run(modalId, { Interaction });
    }
}));
client.on('guildMemberAdd', (member) => __awaiter(void 0, void 0, void 0, function* () {
    if (member.user.bot)
        return;
    yield (0, registerAll_js_1.register)(member);
}));
client.on('guildMemberRemove', (member) => __awaiter(void 0, void 0, void 0, function* () {
    if (member.user.bot)
        return;
    yield User_js_1.default.deleteOne({ id: member.id });
}));
client.on('userUpdate', (oldUser, newUser) => __awaiter(void 0, void 0, void 0, function* () {
    if (oldUser.username == newUser.username)
        return;
    yield (0, updateDb_js_1.default)({ id: newUser.id }, 'username', newUser.username);
}));
client.on('messageCreate', (msg) => __awaiter(void 0, void 0, void 0, function* () {
    if (msg.author.bot)
        return;
    (0, manageChat_js_1.default)(msg);
}));
socket.on('upvote', (data) => __awaiter(void 0, void 0, void 0, function* () {
    yield processVote(data);
}));
socket.on('test', (data) => __awaiter(void 0, void 0, void 0, function* () {
    yield processVote(data);
}));
client.login(process.env.TOKEN);
exports.default = client;
