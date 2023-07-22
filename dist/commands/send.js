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
const User_js_1 = __importDefault(require("../schema/User.js"));
const server_js_1 = __importDefault(require("../server.js"));
const assignCurrency_js_1 = __importDefault(require("../helpers/assignCurrency.js"));
const updateDb_js_1 = __importDefault(require("../helpers/updateDb.js"));
const toolbox_js_1 = require("../helpers/toolbox.js");
const money_json_1 = require("../data/money.json");
const settings_json_1 = require("../data/settings.json");
const emojis_json_1 = require("../data/emojis.json");
exports.default = (args) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const interaction = args.Interaction;
    const subCmd = interaction.options.getSubcommand();
    const target = interaction.options.getUser('friend', true);
    const amount = interaction.options.getNumber('amount', true);
    let purpose = interaction.options.getString('purpose');
    const validPurpose = ["ramen", "events", "missions", "nitro", "roles", "invites"];
    if (!server_js_1.default.user || !server_js_1.default.user.avatar)
        return;
    if (subCmd !== 'fame' && subCmd !== 'elixir')
        return;
    if (!validPurpose.includes(purpose ? purpose : ''))
        purpose = 'noroot';
    if (interaction.user.id == target.id) {
        yield interaction.reply({
            content: "You can't send money to yourself",
            ephemeral: true
        });
        return;
    }
    const user = yield User_js_1.default.findOne({ id: interaction.user.id });
    const friend = yield User_js_1.default.findOne({ id: target.id });
    if (!friend || !user) {
        yield interaction.reply({
            content: "One of you is not registered, use `/register`",
            ephemeral: true
        });
        return;
    }
    if (((_c = (_b = (_a = friend.inventory) === null || _a === void 0 ? void 0 : _a.services) === null || _b === void 0 ? void 0 : _b[10]) === null || _c === void 0 ? void 0 : _c.bought) == true) {
        yield interaction.reply({
            content: "You can't transfer money to a Tier 5",
            ephemeral: true
        });
        return;
    }
    if (typeof (user === null || user === void 0 ? void 0 : user.totalElixir) != 'number' || typeof (user === null || user === void 0 ? void 0 : user.totalFame) != 'number')
        return;
    const deltaTime = Date.now() - +user.sendCooldown;
    if (deltaTime < settings_json_1.sendMoneyCd * 1000) {
        const still = (+(settings_json_1.sendMoneyCd / 60).toFixed(0) - (0, toolbox_js_1.timeRange)(user.sendCooldown, Date.now()).minutes).toFixed(2);
        yield interaction.reply({
            content: `Wait for \`${still} minutes\``,
            ephemeral: true
        });
        return;
    }
    if (amount <= 0) {
        yield interaction.reply({
            content: `Invalid Amount`,
            ephemeral: true
        });
        return;
    }
    const puffy = (_d = interaction.guild) === null || _d === void 0 ? void 0 : _d.members.cache.find(mem => mem.id == settings_json_1.puffyId);
    if (!puffy)
        return;
    if (purpose != "ramen" && purpose != 'events' && purpose != "missions" &&
        purpose != "nitro" && purpose != "roles" && purpose !== 'noroot' && purpose != 'invites')
        return;
    if (subCmd == 'fame') {
        const { finalAmt, tax } = afterTax(amount, money_json_1.fame.tax.transfer, money_json_1.fame.tax.noTaxTransferLim);
        if (finalAmt > (user === null || user === void 0 ? void 0 : user.totalFame)) {
            yield interaction.reply({
                content: "You do not have enough fame",
                ephemeral: true
            });
            return;
        }
        if (tax < money_json_1.fame.tax.noCooldownTaxFameAmt)
            yield (0, updateDb_js_1.default)({ id: user.id }, 'sendCooldown', Date.now());
        yield assignCurrency_js_1.default.fame(friend === null || friend === void 0 ? void 0 : friend.id, purpose, finalAmt);
        yield assignCurrency_js_1.default.spend.fame(user.id, finalAmt);
        if (tax > 0)
            yield assignCurrency_js_1.default.fame(puffy.id, 'noroot', tax);
        const receipt = sendReceipt(subCmd, interaction, target.id, amount, tax, finalAmt);
        if (!receipt)
            return;
        const puffLog = (_e = interaction.guild) === null || _e === void 0 ? void 0 : _e.channels.cache.find(ch => ch.id == settings_json_1.puffyTaxLog);
        if ((puffLog === null || puffLog === void 0 ? void 0 : puffLog.isText()) && tax > 0)
            yield puffLog.send(`**+${tax} ${subCmd}**`);
        yield interaction.reply({ embeds: [receipt] });
    }
    if (subCmd == 'elixir') {
        const { finalAmt, tax } = afterTax(amount, money_json_1.elixir.tax.transfer, money_json_1.elixir.tax.noTaxTransferLim);
        if (finalAmt > (user === null || user === void 0 ? void 0 : user.totalElixir)) {
            yield interaction.reply({
                content: "You do not have enough elixir",
                ephemeral: true
            });
            return;
        }
        if (tax < money_json_1.elixir.tax.noCooldownTaxElixirAmt)
            yield (0, updateDb_js_1.default)({ id: user.id }, 'sendCooldown', Date.now());
        yield assignCurrency_js_1.default.elixir(friend === null || friend === void 0 ? void 0 : friend.id, purpose, finalAmt);
        yield assignCurrency_js_1.default.spend.elixir(user.id, finalAmt);
        if (tax > 0)
            yield assignCurrency_js_1.default.elixir(puffy.id, 'noroot', tax);
        const receipt = sendReceipt(subCmd, interaction, target.id, amount, tax, finalAmt);
        if (!receipt)
            return;
        const puffLog = (_f = interaction.guild) === null || _f === void 0 ? void 0 : _f.channels.cache.find(ch => ch.id == settings_json_1.puffyTaxLog);
        if ((puffLog === null || puffLog === void 0 ? void 0 : puffLog.isText()) && tax > 0)
            yield puffLog.send(`**+${tax} ${subCmd}**`);
        yield interaction.reply({ embeds: [receipt] });
    }
});
function afterTax(amt, tax, noTaxLimit) {
    if (amt <= noTaxLimit)
        return {
            finalAmt: amt,
            tax: 0
        };
    const taxIncrement = (tax / 100) * (amt - noTaxLimit);
    return {
        finalAmt: amt + +taxIncrement.toFixed(2),
        tax: +taxIncrement.toFixed(2)
    };
}
function sendReceipt(subCmd, interaction, target, amount, tax, finalAmt) {
    if (!server_js_1.default.user)
        return;
    return new discord_js_1.MessageEmbed({
        title: `${emojis_json_1.money} ${subCmd.toUpperCase()} TRANSFER RECEIPT`,
        description: `**From: **<@${interaction.user.id}>\n**To:** <@${target}>\n**Amount: \`${amount} ${subCmd}\`**\n**Tax: \`${tax} ${subCmd}\`**\n**Final Amount: \`${finalAmt} ${subCmd}\`**`,
        thumbnail: {
            url: server_js_1.default.user.displayAvatarURL()
        },
        footer: {
            text: `${interaction.createdAt.toString().replace(/\([A-Z a-z]+\)/g, '')}`,
            iconURL: interaction.user.displayAvatarURL()
        }
    });
}
