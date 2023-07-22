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
const emojis_json_1 = require("../data/emojis.json");
const User_js_1 = __importDefault(require("../schema/User.js"));
const server_js_1 = __importDefault(require("../server.js"));
exports.default = (args) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const interaction = args.Interaction;
    const user = yield User_js_1.default.findOne({ id: interaction.user.id });
    if (!user) {
        yield interaction.reply({
            content: "You are not registered, use `/register`",
            ephemeral: true
        });
        return;
    }
    const embed = new discord_js_1.MessageEmbed({
        title: `${emojis_json_1.earning} Balance`,
        description: `**Fame:** \`${user.totalFame.toFixed(2)}\`\n**Elixir:** \`${user.totalElixir.toFixed(2)}\``,
        thumbnail: { url: (_a = server_js_1.default.user) === null || _a === void 0 ? void 0 : _a.displayAvatarURL() },
        footer: {
            text: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL()
        }
    });
    try {
        yield interaction.reply({ embeds: [embed] });
    }
    catch (e) {
        null;
    }
});
