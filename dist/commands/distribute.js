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
const server_js_1 = __importDefault(require("../server.js"));
const assignCurrency_js_1 = __importDefault(require("../helpers/assignCurrency.js"));
const impVar_json_1 = require("../data/impVar.json");
const toolbox_js_1 = require("../helpers/toolbox.js");
const emojis_json_1 = __importDefault(require("../data/emojis.json"));
const settings_json_1 = require("../data/settings.json");
const User_js_1 = __importDefault(require("../schema/User.js"));
const schemaKeys = ["ramen", "events", "missions", "nitro", "roles", "invites"];
exports.default = (args) => __awaiter(void 0, void 0, void 0, function* () {
    const interaction = args.Interaction;
    const subCmd = interaction.options.getSubcommand();
    const target = interaction.options.getMentionable('target', true).valueOf();
    const amount = interaction.options.getNumber('amount', true);
    let purpose = interaction.options.getString('purpose');
    const server = yield server_js_1.default.guilds.fetch(impVar_json_1.TAISHOKU_SERVER_ID);
    yield interaction.deferReply();
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
    if (typeof target != 'string')
        return;
    if (subCmd !== 'fame' && subCmd !== 'elixir')
        return;
    if (!schemaKeys.includes(purpose ? purpose : ''))
        purpose = 'noroot';
    if (amount <= 0) {
        yield interaction.editReply({
            content: `**Invalid Amount**`
        });
        return;
    }
    let targetType = yield (0, toolbox_js_1.isUserOrRole)(target);
    let membCount;
    let members;
    if (targetType == 'role') {
        let data = yield (0, toolbox_js_1.getUsersByRole)(target, [interaction.user.id]);
        membCount = data.memberCount;
        members = data.members;
    }
    else {
        membCount = 1;
        members = [(yield server.members.fetch(target))];
    }
    ;
    if (membCount == 0 || members[0].id == interaction.user.id) {
        yield interaction.editReply({
            content: "**No valid users of specific role/id found!**"
        });
        return;
    }
    members.forEach((member) => __awaiter(void 0, void 0, void 0, function* () {
        if (purpose != "ramen" && purpose != 'events' && purpose != "missions" &&
            purpose != "nitro" && purpose != "roles" && purpose !== 'noroot' && purpose != 'invites')
            return;
        if (!(yield User_js_1.default.findOne({ id: member.id })))
            return;
        yield assignCurrency_js_1.default[subCmd](member.id, purpose, amount);
    }));
    const embed = new discord_js_1.MessageEmbed({
        title: `${emojis_json_1.default.money} ${subCmd.toUpperCase()} TRANSFER RECEIPT`,
        description: `**From: **<@${interaction.user.id}>\n**To: **<@${targetType == 'role' ? "&" : ""}${target}>\n**Sum Of: \`${amount * membCount} ${subCmd}\`**\n**Total Receivers: \`${membCount}\`**\n**Perhead: \`${amount} ${subCmd}\`**`,
        thumbnail: {
            url: server_js_1.default.user.displayAvatarURL()
        },
        footer: {
            text: `${interaction.createdAt.toString().replace(/\([A-Z a-z]+\)/g, '')}`,
            iconURL: interaction.user.displayAvatarURL()
        }
    });
    yield interaction.editReply({ embeds: [embed] });
    const logChannel = server_js_1.default.channels.cache.find(ch => ch.id == settings_json_1.distributeLogs);
    if (logChannel === null || logChannel === void 0 ? void 0 : logChannel.isText())
        yield logChannel.send({ embeds: [embed] });
});
