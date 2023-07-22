"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const registerAll_js_1 = require("../helpers/registerAll.js");
const User_js_1 = __importDefault(require("../schema/User.js"));
const money_json_1 = require("../data/money.json");
const toolbox_js_1 = require("../helpers/toolbox.js");
const updateDb_js_1 = __importDefault(require("../helpers/updateDb.js"));
const assignCurrency_js_1 = __importDefault(require("../helpers/assignCurrency.js"));
const settings_json_1 = require("../data/settings.json");
const server_js_1 = __importDefault(require("../server.js"));
const emojis_json_1 = require("../data/emojis.json");
exports.default = (msg) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const author = msg.author;
    let user = yield User_js_1.default.findOne({ id: author.id });
    const member = (_b = (yield ((_a = msg.guild) === null || _a === void 0 ? void 0 : _a.members.fetch()))) === null || _b === void 0 ? void 0 : _b.find(mem => mem.id == author.id);
    if (!member)
        return;
    if (!server_js_1.default.user)
        return;
    if (!user) {
        let newUser = yield (0, registerAll_js_1.register)(member);
        if (newUser)
            user = newUser;
    }
    if (!user)
        return;
    if (!(user === null || user === void 0 ? void 0 : user.chat)) {
        user.chat = {
            last: '0',
            perIntervalMsg: 0,
            fameCollected: 0,
            elixirCollected: 0
        };
        user = yield user.save();
    }
    if (!user.chat)
        return;
    const deltaTime = (0, toolbox_js_1.timeRange)(user.chat.last, Date.now());
    if (deltaTime.seconds >= money_json_1.rewards.chat.time) {
        yield (0, updateDb_js_1.default)({ id: user.id }, 'chat.last', Date.now());
        const msgsWorthReward = user.chat.perIntervalMsg;
        yield (0, updateDb_js_1.default)({ id: user.id }, 'chat.perIntervalMsg', 1);
        let reward = 0;
        if (msgsWorthReward >= money_json_1.rewards.chat.bp.a && msgsWorthReward < money_json_1.rewards.chat.bp.b)
            reward = money_json_1.rewards.chat.a;
        if (msgsWorthReward >= money_json_1.rewards.chat.bp.b && msgsWorthReward < money_json_1.rewards.chat.bp.c)
            reward = money_json_1.rewards.chat.b;
        if (msgsWorthReward >= money_json_1.rewards.chat.bp.c)
            reward = money_json_1.rewards.chat.c;
        if (reward == 0)
            return;
        yield assignCurrency_js_1.default.fame(user.id, 'chat', reward);
        const chatLogChannel = server_js_1.default.channels.cache.find(ch => ch.id == settings_json_1.chatLog);
        const embed = new discord_js_1.MessageEmbed({
            title: `${emojis_json_1.chat} Chat Reward`,
            description: `**To:** ${author}\n**Reward:** \`${reward} Fame\``,
            thumbnail: { url: server_js_1.default.user.displayAvatarURL() },
            footer: {
                text: `${msg.createdAt.toString().replace(/\([A-Z a-z]+\)/g, '')}`,
                iconURL: author.displayAvatarURL()
            }
        });
        if (chatLogChannel === null || chatLogChannel === void 0 ? void 0 : chatLogChannel.isText())
            yield chatLogChannel.send({ embeds: [embed] });
    }
    else {
        yield (0, updateDb_js_1.default)({ id: user.id }, 'chat.perIntervalMsg', user.chat.perIntervalMsg + 1);
    }
});
