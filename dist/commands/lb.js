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
const emojis_json_1 = require("../data/emojis.json");
exports.default = (args) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const interaction = args.Interaction;
    yield interaction.deferReply();
    const lbType = interaction.options.getSubcommand();
    const { findQuery, where } = queryForSorting(lbType);
    if (!findQuery)
        return;
    const sortQueryObject = {};
    sortQueryObject[findQuery[1]] = -1;
    const allUsers = yield User_js_1.default.find({}, findQuery).sort(sortQueryObject);
    const total = allUsers.length;
    const lastPage = Math.ceil(total / 10);
    const { embed, row } = yield showPage(1, allUsers, total, interaction.user.id, where, lbType, interaction.user.displayAvatarURL());
    const msg = yield interaction.editReply({ embeds: [embed], components: [row] });
    const filter = (btn) => {
        return btn.user.id == interaction.user.id && msg.id == btn.message.id;
    };
    const collector = (_a = interaction.channel) === null || _a === void 0 ? void 0 : _a.createMessageComponentCollector({
        filter, time: 10 * 60 * 1000
    });
    collector === null || collector === void 0 ? void 0 : collector.on('collect', (btn) => __awaiter(void 0, void 0, void 0, function* () {
        var _b;
        yield btn.deferUpdate();
        let _page = (_b = btn.message.embeds[0].footer) === null || _b === void 0 ? void 0 : _b.text.split('Page ')[1].split('of')[0].trim();
        if (!_page)
            return;
        let page = +_page;
        if (btn.customId == 'extremeLeft') {
            page = 1;
        }
        if (btn.customId == 'turnPageRight') {
            page += 1;
        }
        if (btn.customId == 'turnPageLeft') {
            page -= 1;
        }
        if (btn.customId == 'extremeRight') {
            page = lastPage;
        }
        if (btn.customId == 'yourPage') {
            const userIndex = allUsers.findIndex(val => val.id == interaction.user.id);
            const userPage = Math.ceil((userIndex + 1) / 10);
            page = userPage;
        }
        const { embed, row } = yield showPage(page, allUsers, lastPage, interaction.user.id, where, lbType, interaction.user.displayAvatarURL());
        yield interaction.editReply({
            embeds: [embed],
            components: [row]
        });
    }));
    collector === null || collector === void 0 ? void 0 : collector.on('end', (btn) => __awaiter(void 0, void 0, void 0, function* () {
        var _c;
        let embed = (_c = btn.last()) === null || _c === void 0 ? void 0 : _c.message.embeds[0];
        if (!embed)
            return;
        yield interaction.editReply({ embeds: [embed], components: [] });
    }));
});
function queryForSorting(type) {
    if (type == 'fame' || type == 'elixir') {
        return {
            findQuery: ['id', `total${type.replace(type[0], type[0].toUpperCase())}`, 'username'],
            where: `total${type.replace(type[0], type[0].toUpperCase())}`
        };
    }
    else {
        if (type == 'games')
            return {
                findQuery: ['id', 'games.won', 'username'], where: 'won'
            };
        if (type == 'missions')
            return {
                findQuery: ['id', 'missions.missionsCompleted', 'username'], where: 'missionsCompleted'
            };
    }
}
function showPage(pageNo, all, totalPage, id, where, type, avatar) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const from = (pageNo - 1) * 10;
        const userIndex = all.findIndex(val => val.id == id);
        const userExists = userIndex > -1 ? true : false;
        let desc = ``;
        let i = 0;
        for (let user_i = from; user_i < from + 10; user_i++) {
            const user = all[user_i];
            if (!user)
                break;
            desc += `\`#${((pageNo - 1) * 10) + i + 1}\` **${user.username}** [${user[where].toFixed(0)} ${type}](https://www.youtube.com/watch?v=xvFZjo5PgG0)\n`;
            i += 1;
        }
        const embed = new discord_js_1.MessageEmbed({
            title: `${emojis_json_1.showcase} ${type} LB`.toUpperCase(),
            description: desc,
            thumbnail: { url: (_a = server_js_1.default.user) === null || _a === void 0 ? void 0 : _a.displayAvatarURL() },
            footer: {
                text: `Page ${pageNo} of ${totalPage}`,
                iconURL: avatar
            }
        });
        const row = new discord_js_1.MessageActionRow()
            .addComponents(new discord_js_1.MessageButton()
            .setEmoji(emojis_json_1.fastLeft)
            .setCustomId('extremeLeft')
            .setStyle('SECONDARY')
            .setDisabled(pageNo == 1))
            .addComponents(new discord_js_1.MessageButton()
            .setEmoji(emojis_json_1.left)
            .setCustomId('turnPageLeft')
            .setStyle('SUCCESS')
            .setDisabled(pageNo == 1))
            .addComponents(new discord_js_1.MessageButton()
            .setEmoji(emojis_json_1.right)
            .setCustomId('turnPageRight')
            .setStyle('SUCCESS')
            .setDisabled(pageNo == totalPage))
            .addComponents(new discord_js_1.MessageButton()
            .setEmoji(emojis_json_1.fastRight)
            .setCustomId('extremeRight')
            .setStyle('SECONDARY')
            .setDisabled(pageNo == totalPage));
        if (userExists) {
            row.addComponents(new discord_js_1.MessageButton()
                .setLabel('Your Page')
                .setCustomId(`yourPage`)
                .setStyle('PRIMARY')
                .setDisabled(pageNo == Math.ceil(userIndex / 10)));
        }
        return { embed, row };
    });
}
