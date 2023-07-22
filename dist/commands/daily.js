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
const server_js_1 = __importDefault(require("../server.js"));
const User_js_1 = __importDefault(require("../schema/User.js"));
const assignCurrency_js_1 = __importDefault(require("../helpers/assignCurrency.js"));
const discord_js_1 = require("discord.js");
const updateDb_js_1 = __importDefault(require("../helpers/updateDb.js"));
const toolbox_js_1 = require("../helpers/toolbox.js");
const timings_json_1 = __importDefault(require("../data/timings.json"));
const fameForRoles_json_1 = __importDefault(require("../data/fameForRoles.json"));
const money_json_1 = require("../data/money.json");
const emojis_json_1 = require("../data/emojis.json");
const prestigeRoles_json_1 = __importDefault(require("../data/prestigeRoles.json"));
const ELIXIR_ROLE = '1130679593112719442';
exports.default = (args) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const interaction = args.Interaction;
    yield interaction.deferReply({ ephemeral: true });
    const discordUser = interaction.user;
    const member = (_b = (yield ((_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.members.fetch()))) === null || _b === void 0 ? void 0 : _b.find(mem => mem.id == discordUser.id);
    const user = yield User_js_1.default.findOne({ id: discordUser.id });
    const userRoles = member === null || member === void 0 ? void 0 : member.roles.cache.map(role => role.id);
    if (!userRoles)
        return;
    let benefitRole = 0;
    let benefitNitro = 0;
    let benefitPrestige = 0;
    let elixirs = 5;
    let nitroDone = false;
    let defaultDone = false;
    for (let roleId_i in Object.keys(fameForRoles_json_1.default)) {
        if (nitroDone && defaultDone)
            break;
        let impRoleId = Object.keys(fameForRoles_json_1.default)[+roleId_i];
        let roleBenefit = Object.values(fameForRoles_json_1.default)[+roleId_i];
        if ((member === null || member === void 0 ? void 0 : member.roles.cache.find(r => r.id == impRoleId)) && !defaultDone) {
            benefitRole += roleBenefit;
            defaultDone = true;
        }
        if ((member === null || member === void 0 ? void 0 : member.roles.cache.find(r => r.id == money_json_1.rewards.booster.id)) && !nitroDone) {
            benefitNitro += money_json_1.rewards.booster.fame;
            nitroDone = true;
        }
    }
    for (let pRole_i in Object.keys(prestigeRoles_json_1.default)) {
        if (+pRole_i == (Object.keys(prestigeRoles_json_1.default).length - 1))
            break;
        let key = Object.keys(prestigeRoles_json_1.default)[pRole_i];
        let pRole = prestigeRoles_json_1.default[key];
        let benefitPerTier = +money_json_1.rewards.premium[+pRole_i + 1];
        if (member === null || member === void 0 ? void 0 : member.roles.cache.find(r => r.id == pRole)) {
            benefitPrestige += benefitPerTier;
        }
        else
            break;
    }
    if (!user || !user.reminder || !member) {
        if (!user) {
            interaction.editReply({
                content: 'You are not registered, use `/register`'
            });
        }
        return;
    }
    const deltaTime = Date.now() - +user.reminder.daily;
    if (deltaTime > timings_json_1.default.daily * 1000) {
        yield assignCurrency_js_1.default.fame(user.id, 'missions', money_json_1.rewards.daily);
        yield assignCurrency_js_1.default.fame(user.id, 'roles', benefitRole);
        yield assignCurrency_js_1.default.fame(user.id, 'nitro', benefitNitro);
        const eligibleForElixir = member.roles.cache.find(r => r.id == ELIXIR_ROLE);
        if (eligibleForElixir) {
            yield assignCurrency_js_1.default.elixir(user.id, 'roles', elixirs);
        }
        const embed = new discord_js_1.MessageEmbed({
            title: `${emojis_json_1.earning} DAILY REWARD`,
            description: `**Default Reward:** \`${money_json_1.rewards.daily}F\`\n**Role Benefit:** \`${benefitRole}F\`\n**Nitro Benefit:** \`${benefitNitro}F\`\n**Prestige Benefit:** \`${benefitPrestige}F\`\n==========\n**Elixir Benefit:** \`${eligibleForElixir ? elixirs : 0}E\``,
            thumbnail: {
                url: (_c = server_js_1.default.user) === null || _c === void 0 ? void 0 : _c.displayAvatarURL()
            },
            footer: {
                text: `Come again tomorrow ${discordUser.username}`,
                iconURL: discordUser.displayAvatarURL()
            }
        });
        yield interaction.editReply({
            embeds: [embed]
        });
        yield (0, updateDb_js_1.default)({ id: user.id }, 'reminder.daily', Date.now());
    }
    else {
        const still = (24 - (0, toolbox_js_1.timeRange)(user.reminder.daily, Date.now()).hours).toFixed(2);
        const embed = new discord_js_1.MessageEmbed({
            title: `${emojis_json_1.clock} DAILY`,
            description: `\`${still}hrs\` are still left`,
            footer: {
                iconURL: discordUser.displayAvatarURL(),
                text: 'Try again later'
            }
        });
        interaction.editReply({
            embeds: [embed]
        });
    }
});
