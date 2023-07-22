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
const timings_json_1 = require("../data/timings.json");
const emojis_json_1 = require("../data/emojis.json");
const discord_js_1 = require("discord.js");
const User_js_1 = __importDefault(require("../schema/User.js"));
const toolbox_js_1 = require("../helpers/toolbox.js");
const server_js_1 = __importDefault(require("../server.js"));
exports.default = (args) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const interaction = args.Interaction;
    const user = yield User_js_1.default.findOne({ id: interaction.user.id });
    if (!user) {
        yield interaction.reply({
            content: 'You are not registered, use `/register`',
            ephemeral: true
        });
        return;
    }
    yield interaction.deferReply();
    const now = Date.now();
    const dailyDb = (_a = user.reminder) === null || _a === void 0 ? void 0 : _a.daily;
    const dailyDt = (0, toolbox_js_1.timeRange)(dailyDb, now);
    const dText = dailyDb ? (dailyDt.seconds > timings_json_1.daily)
        ? emojis_json_1.correct
        : `\`${Math.ceil(24 - dailyDt.hours)} hr\``
        : emojis_json_1.correct;
    const missionDb = (_b = user.missions) === null || _b === void 0 ? void 0 : _b.lastMission;
    const missionDt = (0, toolbox_js_1.timeRange)(missionDb, now);
    const mText = missionDb ? (missionDt.seconds > timings_json_1.mission)
        ? emojis_json_1.correct
        : `\`${Math.ceil(120 - missionDt.minutes)} min\``
        : emojis_json_1.correct;
    const coinflipDb = (_c = user.games) === null || _c === void 0 ? void 0 : _c.coinflip;
    const coinflipDt = (0, toolbox_js_1.timeRange)(coinflipDb, now);
    const coinText = timings_json_1.coinflip ? (coinflipDt.seconds > timings_json_1.coinflip)
        ? emojis_json_1.correct
        : `\`${Math.ceil(15 - coinflipDt.minutes)} min\``
        : emojis_json_1.correct;
    const rpsDb = (_d = user.games) === null || _d === void 0 ? void 0 : _d.rps;
    const rpsDt = (0, toolbox_js_1.timeRange)(rpsDb, now);
    const rpsText = timings_json_1.rps ? (rpsDt.seconds > timings_json_1.rps)
        ? emojis_json_1.correct
        : `\`${Math.ceil(5 - rpsDt.minutes)} min\``
        : emojis_json_1.correct;
    const sendCdDb = user.sendCooldown;
    const sendCdDt = (0, toolbox_js_1.timeRange)(sendCdDb, now);
    const sendText = timings_json_1.sendCd ? (sendCdDt.seconds > timings_json_1.sendCd)
        ? emojis_json_1.correct
        : `\`${Math.ceil(5 - sendCdDt.minutes)} min\``
        : emojis_json_1.correct;
    const embed = new discord_js_1.MessageEmbed({
        title: `${emojis_json_1.clock} Cooldowns`,
        fields: [
            {
                name: `MISSIONS`,
                value: `**Quiz:** ${mText}\n**Daily:** ${dText}`,
                inline: true
            },
            {
                name: `GAMES`,
                value: `**Coinflip:** ${coinText}\n**Rps:** ${rpsText}`,
                inline: true
            },
            {
                name: "OTHERS",
                value: `**/send**: ${sendText}`
            }
        ],
        footer: {
            iconURL: (_e = server_js_1.default.user) === null || _e === void 0 ? void 0 : _e.displayAvatarURL(),
            text: "new minigame: ( /games rps )"
        }
    });
    yield interaction.editReply({ embeds: [embed] });
});
