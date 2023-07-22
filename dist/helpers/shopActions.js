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
const uuid_1 = require("uuid");
const User_js_1 = __importDefault(require("../schema/User.js"));
const assignCurrency_js_1 = __importDefault(require("./assignCurrency.js"));
const updateDb_js_1 = __importDefault(require("./updateDb.js"));
const toolbox_js_1 = require("./toolbox.js");
const settings_json_1 = require("../data/settings.json");
const emojis_json_1 = require("../data/emojis.json");
const villages_json_1 = __importDefault(require("../data/villages.json"));
const titles_json_1 = __importDefault(require("../data/titles.json"));
const prestigeRoles_json_1 = __importDefault(require("../data/prestigeRoles.json"));
exports.default = (item, interaction) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    if (!interaction.member)
        return;
    const user = (yield User_js_1.default.findOne({ id: interaction.user.id }));
    if (!user) {
        yield interaction.reply({
            content: 'You are not registered, use `/register`',
            ephemeral: true
        });
        return;
    }
    const userFames = user.totalFame;
    if (userFames < item.price) {
        interaction.reply({
            content: "You can't afford it, use `/daily` or `/mission` to earn more",
            ephemeral: true
        });
        return;
    }
    const logChannel = server_js_1.default.channels.cache.find(ch => ch.id == settings_json_1.storeLogsChannel);
    const member = (_b = (yield ((_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.members.fetch()))) === null || _b === void 0 ? void 0 : _b.find(user => user.id == interaction.user.id);
    const purchaseId = (0, uuid_1.v4)();
    if (item.name == 'Title') {
        yield interaction.deferReply({ ephemeral: true });
        const userRoles = member === null || member === void 0 ? void 0 : member.roles.cache.map(role => role.id);
        let titleList = titles_json_1.default.filter(title => !(userRoles === null || userRoles === void 0 ? void 0 : userRoles.includes(title.value)));
        if (titleList.length == 1) {
            yield (0, updateDb_js_1.default)({ id: user.id }, 'inventory.goods.1.bought', true);
        }
        if (titleList.length == 0) {
            interaction.editReply({
                content: "You already bought all the titles, awesome"
            });
            return;
        }
        const row = new discord_js_1.MessageActionRow()
            .addComponents(new discord_js_1.MessageSelectMenu()
            .setCustomId('title')
            .setPlaceholder('If you loose this msg, contact admins')
            .addOptions(titleList));
        const embed = (0, toolbox_js_1.generateReceipt)(user, item, interaction, purchaseId);
        yield assignCurrency_js_1.default.spend.fame(user.id, item.price, purchaseId);
        if (logChannel === null || logChannel === void 0 ? void 0 : logChannel.isText())
            yield logChannel.send({ embeds: [embed] });
        yield interaction.editReply({
            embeds: [embed],
            components: [row]
        });
    }
    else if (item.name == 'Change Village') {
        yield interaction.deferReply({ ephemeral: true });
        yield assignCurrency_js_1.default.spend.fame(user.id, item.price, purchaseId);
        const list = member === null || member === void 0 ? void 0 : member.roles.cache.map(role => role.id);
        const villagesList = Object.keys(villages_json_1.default).map((vill, i) => {
            if (!list || !list.includes(Object.values(villages_json_1.default)[i])) {
                return {
                    label: vill,
                    description: `The ${vill} village`,
                    value: Object.values(villages_json_1.default)[i]
                };
            }
        }).filter(vill => vill != undefined);
        const row = new discord_js_1.MessageActionRow()
            .addComponents(new discord_js_1.MessageSelectMenu()
            .setCustomId('changeVillage')
            .setPlaceholder('If you loose this msg, contact admins')
            .addOptions(villagesList));
        const embed = (0, toolbox_js_1.generateReceipt)(user, item, interaction, purchaseId);
        if (logChannel === null || logChannel === void 0 ? void 0 : logChannel.isText())
            yield logChannel.send({ embeds: [embed] });
        yield interaction.editReply({
            embeds: [embed],
            components: [row]
        });
    }
    else if (item.name == 'Rogue Ninja') {
        yield interaction.deferReply({ ephemeral: true });
        if (!((_c = user.inventory) === null || _c === void 0 ? void 0 : _c.services))
            return;
        if ((_e = (_d = user.inventory) === null || _d === void 0 ? void 0 : _d.services['4']) === null || _e === void 0 ? void 0 : _e.bought) {
            yield interaction.editReply({
                content: "You are already a Rogue Ninja"
            });
            return;
        }
        yield (member === null || member === void 0 ? void 0 : member.roles.add(settings_json_1.rogueId));
        const embed = (0, toolbox_js_1.generateReceipt)(user, item, interaction, purchaseId);
        yield assignCurrency_js_1.default.spend.fame(user.id, item.price, purchaseId);
        yield (0, updateDb_js_1.default)({ id: user.id }, "inventory.services.4.bought", true);
        yield interaction.editReply({
            content: `**You are now a ROGUE NINJA ${emojis_json_1.showcase}**`,
            embeds: [embed]
        });
        if (logChannel === null || logChannel === void 0 ? void 0 : logChannel.isText())
            logChannel.send({ embeds: [embed] });
    }
    else if (item.name == 'Personal Role') {
        const modal = new discord_js_1.Modal()
            .setCustomId("createPersonalRole")
            .setTitle("Personal Role");
        const row = new discord_js_1.MessageActionRow()
            .addComponents(new discord_js_1.TextInputComponent()
            .setCustomId('roleName')
            .setLabel('A sweet name for your role')
            .setStyle('SHORT'));
        console.log('here in modal');
        modal.addComponents(row);
        yield interaction.showModal(modal);
    }
    else if (item.name == 'Personal Channel') {
        const modal = new discord_js_1.Modal()
            .setCustomId("createPersonalChannel")
            .setTitle("Personal Channel");
        const row1 = new discord_js_1.MessageActionRow()
            .addComponents(new discord_js_1.TextInputComponent()
            .setCustomId('channelName')
            .setLabel('A sweet name for your channel')
            .setStyle('SHORT'));
        const row2 = new discord_js_1.MessageActionRow()
            .addComponents(new discord_js_1.TextInputComponent()
            .setCustomId('channelTopic')
            .setLabel('A breathtaking topic for your channel')
            .setStyle('PARAGRAPH'));
        const row3 = new discord_js_1.MessageActionRow()
            .addComponents(new discord_js_1.TextInputComponent()
            .setCustomId('channelEmoji')
            .setLabel('A cute emoji for your channel')
            .setStyle('SHORT'));
        modal.addComponents(row1, row2, row3);
        yield interaction.showModal(modal);
    }
    else if (item.name.startsWith('Prestige')) {
        yield interaction.deferReply({ ephemeral: true });
        const convert = { 'I': '1', 'II': '2', 'III': '3', 'IV': '4', 'V': '5' };
        const dbRef = { 1: 6, 2: 7, 3: 8, 4: 9, 5: 10 };
        const tier = item.name.split('Prestige')[1].trim();
        const roleId = prestigeRoles_json_1.default[`Prestige ${tier}`];
        yield (0, updateDb_js_1.default)({ id: user.id }, `inventory.services.${dbRef[convert[tier]]}.bought`, true);
        yield assignCurrency_js_1.default.spend.fame(user.id, item.price, purchaseId);
        yield (member === null || member === void 0 ? void 0 : member.roles.add(roleId));
        const embed = (0, toolbox_js_1.generateReceipt)(user, item, interaction, purchaseId);
        yield interaction.editReply({
            content: `You bought the **Tier ${tier} Prestige**, contact the admins for benefits ${emojis_json_1.showcase}`,
            embeds: [embed]
        });
        if (logChannel === null || logChannel === void 0 ? void 0 : logChannel.isText())
            logChannel.send({ embeds: [embed] });
    }
    else if (item.name == 'Add Bot') {
        yield interaction.deferReply({ ephemeral: true });
        if (!((_f = user.inventory) === null || _f === void 0 ? void 0 : _f.goods))
            return;
        if (!user.inventory.goods[11]) {
            user.inventory.goods[11] = { name: "Add Bot", total: 0 };
            yield user.save();
        }
        const receipt = (0, toolbox_js_1.generateReceipt)(user, item, interaction, purchaseId);
        const modChnl = yield server_js_1.default.channels.fetch(settings_json_1.talkToModChnl);
        if ((modChnl === null || modChnl === void 0 ? void 0 : modChnl.type) != 'GUILD_TEXT')
            return;
        yield modChnl.permissionOverwrites.edit(interaction.user, settings_json_1.channelPermissions);
        yield modChnl.send(`<@${interaction.user.id}> => \`${purchaseId}\` => ${item.name}`);
        if (logChannel === null || logChannel === void 0 ? void 0 : logChannel.isText()) {
            yield logChannel.send({ embeds: [receipt] });
        }
        yield interaction.editReply({
            content: `Head over to <#${settings_json_1.talkToModChnl}> and ask the mods to add a bot`,
            embeds: [receipt]
        });
        yield assignCurrency_js_1.default.spend.fame(user.id, item.price, purchaseId);
        yield (0, updateDb_js_1.default)(user.id, 'inventory.goods.11.total', (prev) => prev.inventory.goods[11].total + 1);
    }
});
