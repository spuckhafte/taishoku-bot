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
const assignCurrency_js_1 = __importDefault(require("../helpers/assignCurrency.js"));
const updateDb_js_1 = __importDefault(require("../helpers/updateDb.js"));
const User_js_1 = __importDefault(require("../schema/User.js"));
const discord_js_1 = require("discord.js");
const server_js_1 = __importDefault(require("../server.js"));
const uuid_1 = require("uuid");
const toolbox_js_1 = require("../helpers/toolbox.js");
const shop_json_1 = require("../data/shop.json");
const settings_json_1 = require("../data/settings.json");
exports.default = (args) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const interaction = args.Interaction;
    if (!interaction.guild)
        return;
    yield interaction.deferReply({ ephemeral: true });
    const member = (_b = (yield ((_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.members.fetch()))) === null || _b === void 0 ? void 0 : _b.find(user => user.id == interaction.user.id);
    const channelName = interaction.fields.getTextInputValue('channelName');
    const channelTopic = interaction.fields.getTextInputValue('channelTopic');
    const channelEmoji = interaction.fields.getTextInputValue('channelEmoji');
    const purchaseId = (0, uuid_1.v4)();
    if (!member)
        return;
    if (!channelName || !channelTopic || !channelEmoji) {
        interaction.editReply({
            content: "Invalid details, try again"
        });
        return;
    }
    const channel = yield interaction.guild.channels.create(`${channelEmoji}・「${channelName}」`, { parent: settings_json_1.customChannelCategory });
    yield channel.permissionOverwrites.edit(interaction.user, settings_json_1.channelPermissions);
    yield channel.setTopic(channelTopic);
    const item = shop_json_1.shop.find(item => item.name == 'Personal Channel');
    if (!item)
        return;
    yield assignCurrency_js_1.default.spend.fame(interaction.user.id, item.price, purchaseId);
    const user = yield User_js_1.default.findOne({ id: interaction.user.id });
    if (!user) {
        yield interaction.reply({
            content: 'You are not registered, use `/register`',
            ephemeral: true
        });
        return;
    }
    let prev = (_e = (_d = (_c = user.inventory) === null || _c === void 0 ? void 0 : _c.goods) === null || _d === void 0 ? void 0 : _d[5]) === null || _e === void 0 ? void 0 : _e.total;
    yield (0, updateDb_js_1.default)({ id: user.id }, 'inventory.goods.5.total', (prev ? prev : 0) + 1);
    const embed = (0, toolbox_js_1.generateReceipt)(user, item, interaction, purchaseId);
    yield interaction.editReply({
        embeds: [embed],
        content: `<@${user.id}>, here is your personal channel: ${discord_js_1.Formatters.channelMention(channel.id)}`
    });
    const logChannel = server_js_1.default.channels.cache.find(ch => ch.id == settings_json_1.storeLogsChannel);
    if (logChannel === null || logChannel === void 0 ? void 0 : logChannel.isText())
        logChannel.send({ embeds: [embed] });
});
