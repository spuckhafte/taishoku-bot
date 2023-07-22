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
const assignCurrency_js_1 = __importDefault(require("../helpers/assignCurrency.js"));
const User_js_1 = __importDefault(require("../schema/User.js"));
const registerAll_js_1 = require("../helpers/registerAll.js");
const updateDb_js_1 = __importDefault(require("../helpers/updateDb.js"));
const settings_json_1 = require("../data/settings.json");
const server_js_1 = __importDefault(require("../server.js"));
const Heist_js_1 = __importDefault(require("../schema/Heist.js"));
let membersIn = [];
let total = 0;
function load() {
    return __awaiter(this, void 0, void 0, function* () {
        const memFromDb = (yield Heist_js_1.default.find({}))[0];
        membersIn = memFromDb.members;
        total = memFromDb.members.length;
    });
}
load();
exports.default = (args) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const interaction = args.Interaction;
    const msg = yield interaction.reply({ content: `Heist Started`, fetchReply: true });
    const pool = interaction.options.getNumber('pool', true);
    const time = interaction.options.getNumber('time', true);
    const max = interaction.options.getNumber('max', false);
    const filter = interaction.options.getRole('filter', false);
    const author = (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.members.cache.find(mem => mem.id == interaction.user.id);
    if (!(author === null || author === void 0 ? void 0 : author.roles.cache.find(rol => rol.id == settings_json_1.adminId)) && (author === null || author === void 0 ? void 0 : author.id) != settings_json_1.puffyId) {
        yield interaction.editReply('You don\'t have an authority to start a Heist');
        return;
    }
    yield ((_b = interaction.channel) === null || _b === void 0 ? void 0 : _b.send(`${discord_js_1.Formatters.roleMention(settings_json_1.heistPing)}`));
    const row = generateBtn();
    const embed = generateEmbed(pool, time, interaction, max, filter);
    if (msg.type != 'APPLICATION_COMMAND')
        return;
    yield msg.edit({
        embeds: [embed],
        components: [row]
    });
    const collectorFilter = (btn) => {
        return msg.id == btn.message.id;
    };
    const collector = (_c = interaction.channel) === null || _c === void 0 ? void 0 : _c.createMessageComponentCollector({
        filter: collectorFilter,
        max: max ? max : 10000
    });
    collector === null || collector === void 0 ? void 0 : collector.on('collect', (btn) => __awaiter(void 0, void 0, void 0, function* () {
        var _d;
        yield btn.deferUpdate();
        const user = btn.user;
        if (membersIn.includes(user.id))
            return;
        const member = (_d = interaction.guild) === null || _d === void 0 ? void 0 : _d.members.cache.find(mem => mem.id == user.id);
        if (!member)
            return;
        if (filter) {
            if (!(member === null || member === void 0 ? void 0 : member.roles.cache.find(role => role.id == filter.id)))
                return;
        }
        const userDb = yield User_js_1.default.exists({ id: user.id });
        if (!userDb)
            yield (0, registerAll_js_1.register)(member);
        membersIn.push(user.id);
        total += 1;
        const heist = (yield Heist_js_1.default.find({}))[0];
        heist.members.push(user.id);
        yield heist.save();
        yield msg.edit({
            embeds: [generateEmbed(pool, time, interaction, max, filter)],
            components: [generateBtn(max ? max == total : false)]
        });
    }));
    setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
        var _e, _f, _g, _h;
        yield msg.edit({
            embeds: [generateEmbed(pool, time, interaction, max, filter)],
            components: [generateBtn(true)]
        });
        const equalDivision = pool / total;
        const validPairCount = range(total % 2 == 0 ? total / 2 : (total - 1) / 2, 1);
        const totalPairs = random(validPairCount);
        const split = [];
        for (let _ in range(totalPairs, 1)) {
            const randomUser1 = random(membersIn);
            membersIn = membersIn.filter(id => id != randomUser1);
            const randomUser2 = random(membersIn);
            membersIn = membersIn.filter(id => id != randomUser2);
            split.push([randomUser1, randomUser2]);
        }
        const money = {};
        const unequalSplit = [105, 100, 90, 80, 70, 60, 40, 30, 20, 10, 0];
        for (let users of split) {
            let first = +((random(unequalSplit) / 100) * (2 * equalDivision)).toFixed(0);
            let second = +((2 * equalDivision) - first).toFixed(0);
            money[users[0]] = first;
            money[users[1]] = second;
        }
        for (let user of membersIn) {
            money[user] = equalDivision;
        }
        for (let id of Object.keys(money)) {
            const user = yield User_js_1.default.findOne({ id });
            if (!user)
                continue;
            if (money[id] > 0) {
                yield assignCurrency_js_1.default.fame(id, 'noroot', money[id]);
                yield ((_e = interaction.channel) === null || _e === void 0 ? void 0 : _e.send(`<@${id}> got away with **${(+money[id]).toFixed(2)} Fame**`));
            }
            else if (money[id] == 0) {
                yield ((_f = interaction.channel) === null || _f === void 0 ? void 0 : _f.send(`<@${id}> got nothing, sed`));
            }
            else {
                if (user.totalFame > 0) {
                    if (user.totalFame < Math.abs(money[id]))
                        yield (0, updateDb_js_1.default)({ id }, 'totalFame', 0);
                    else
                        yield assignCurrency_js_1.default.spend.fame(id, Math.abs(money[id]));
                }
                yield ((_g = interaction.channel) === null || _g === void 0 ? void 0 : _g.send(`<@${id}> *got caught* and lost **${Math.abs(money[id]).toFixed(2)}**, lmao`));
            }
        }
        total = 0;
        membersIn = [];
        const heist = (yield Heist_js_1.default.find({}))[0];
        heist.members = [];
        yield heist.save();
        yield ((_h = interaction.channel) === null || _h === void 0 ? void 0 : _h.send('**HEIST COMPLETE**'));
    }), time * 60 * 1000);
});
function range(size, startAt = 0) {
    return [...Array(size).keys()].map(i => i + startAt);
}
function random(array) {
    return array[Math.floor(Math.random() * array.length)];
}
function generateEmbed(pool, time, interaction, max, filter) {
    var _a;
    return new discord_js_1.MessageEmbed({
        title: `${emojis_json_1.spending} HEIST`,
        description: `**Pool:** ${pool} Fame\n**Members In:** ${total}\n**Open For:** ${time} minutes${filter ? `\n**Filter:** <@&${filter.id}>` : ''}`,
        footer: {
            text: `Heist started by ${interaction.user.username} for ${max ? max : 'unlimited'} members`,
            iconURL: interaction.user.displayAvatarURL()
        },
        thumbnail: { url: (_a = server_js_1.default.user) === null || _a === void 0 ? void 0 : _a.displayAvatarURL() }
    });
}
function generateBtn(disable = false) {
    return new discord_js_1.MessageActionRow()
        .addComponents(new discord_js_1.MessageButton()
        .setCustomId('getInHeist')
        .setLabel(disable ? 'Closed' : 'Get In')
        .setStyle('PRIMARY')
        .setDisabled(disable));
}
