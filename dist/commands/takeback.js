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
const toolbox_js_1 = require("../helpers/toolbox.js");
const assignCurrency_js_1 = __importDefault(require("../helpers/assignCurrency.js"));
const settings_json_1 = require("../data/settings.json");
const emojis_json_1 = __importDefault(require("../data/emojis.json"));
const discord_js_1 = require("discord.js");
exports.default = (args) => __awaiter(void 0, void 0, void 0, function* () {
    const interaction = args.Interaction;
    const subCmd = interaction.options.getSubcommand();
    const target = interaction.options.getUser('user', true);
    const amount = interaction.options.getNumber('amount', true);
    const allAdmins = yield (0, toolbox_js_1.getUsersByRole)(settings_json_1.adminId);
    let adminIds = allAdmins.members.map(mem => mem.id);
    if (!adminIds.includes(interaction.user.id) && interaction.user.id != settings_json_1.puffyId) {
        yield interaction.editReply({
            content: "Only admins can access this command"
        });
        return;
    }
    if (!server_js_1.default.user || !server_js_1.default.user.avatar)
        return;
    if (subCmd !== 'fame' && subCmd !== 'elixir')
        return;
    if (amount <= 0) {
        yield interaction.editReply({
            content: `**Invalid Amount**`
        });
        return;
    }
    const embed = new discord_js_1.MessageEmbed({
        title: `${emojis_json_1.default.money} ${subCmd.toUpperCase()} TRANSFER RECEIPT (WITHDRAWL)`,
        description: `**From: **<@${target.id}>\n**To: **<@${settings_json_1.puffyId}>\n**Sum Of: \`${amount} ${subCmd}\`**`,
        thumbnail: {
            url: server_js_1.default.user.displayAvatarURL()
        },
        footer: {
            text: `${interaction.createdAt.toString().replace(/\([A-Z a-z]+\)/g, '')}`,
            iconURL: interaction.user.displayAvatarURL()
        }
    });
    yield assignCurrency_js_1.default[subCmd](target.id, 'noroot', (0 - amount));
    yield assignCurrency_js_1.default[subCmd](settings_json_1.puffyId, 'noroot', amount);
    yield interaction.reply({
        embeds: [embed],
        ephemeral: true,
    });
});
