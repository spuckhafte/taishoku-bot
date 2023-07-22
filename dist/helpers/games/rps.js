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
const jimp_1 = __importDefault(require("jimp"));
const emojis_json_1 = require("../../data/emojis.json");
const User_1 = __importDefault(require("../../schema/User"));
const server_1 = __importDefault(require("../../server"));
const assignCurrency_1 = __importDefault(require("../assignCurrency"));
const toolbox_1 = require("../toolbox");
const updateDb_1 = __importDefault(require("../updateDb"));
const promises_1 = __importDefault(require("fs/promises"));
const timings_json_1 = __importDefault(require("../../data/timings.json"));
const waitingTime = 300;
const responseTime = 10;
const ephemeralCond = (user, author, bet) => (user.bot || user.id == author.id || bet <= 0 || bet > 500);
const Games = {};
exports.default = (fame, against, interaction) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const msg = yield interaction.deferReply({
        fetchReply: true, ephemeral: ephemeralCond(against, interaction.user, fame)
    });
    fame = +fame.toFixed(2);
    if (fame <= 0) {
        yield interaction.editReply('Invalid bet amount');
        return;
    }
    if (fame > 500) {
        yield interaction.editReply('You can atmost bet for `500` Fame');
        return;
    }
    let user = yield User_1.default.findOne({ id: interaction.user.id });
    if (!user) {
        yield interaction.editReply({
            content: 'You are not registered, use `/register`'
        });
        return;
    }
    if (!user.games || !((_a = user.games) === null || _a === void 0 ? void 0 : _a.coinflip)) {
        if (!user.games) {
            const newUser = yield (0, toolbox_1.registerGamesIfNot)(user.id);
            if (!newUser)
                return;
            user = newUser;
        }
        if (!((_b = user.games) === null || _b === void 0 ? void 0 : _b.coinflip)) {
            user.games.coinflip = '0';
            let data = yield user.save();
            if (!data)
                return;
            user = data;
        }
    }
    if (user.totalFame < fame) {
        yield interaction.editReply('Check your balance, you can\'t bet on that');
        return;
    }
    let last = (_c = user === null || user === void 0 ? void 0 : user.games) === null || _c === void 0 ? void 0 : _c.rps;
    if (!last)
        last = '0';
    if (timings_json_1.default.rps * 1000 > (+Date.now() - +last)) {
        yield interaction.editReply({
            content: `Wait for \`${(10 - (0, toolbox_1.timeRange)(`${last}`, Date.now()).minutes).toFixed(2)}\` minutes`
        });
        return;
    }
    let bet = fame * 2;
    let rival = yield User_1.default.findOne({ id: against.id });
    if (!rival) {
        yield interaction.editReply('Rival is not registered, ask him to use \`/register\`');
        return;
    }
    if (!rival.games || !((_d = rival.games) === null || _d === void 0 ? void 0 : _d.coinflip)) {
        if (!rival.games) {
            const newrival = yield (0, toolbox_1.registerGamesIfNot)(rival.id);
            if (!newrival)
                return;
            rival = newrival;
        }
        if (!((_e = rival.games) === null || _e === void 0 ? void 0 : _e.coinflip)) {
            rival.games.coinflip = '0';
            let data = yield rival.save();
            if (!data)
                return;
            rival = data;
        }
    }
    if (against.bot || against.id == interaction.user.id) {
        yield interaction.editReply('Invalid rival');
        return;
    }
    if (rival.totalFame < fame) {
        yield interaction.editReply("Your rival can't bet on that");
        return;
    }
    const embed = new discord_js_1.MessageEmbed({
        title: `${emojis_json_1.game} Rock Paper Scissor`,
        description: `**Waiting for *<@${against.id}>* to join**\n**Bet: \`${fame} fame\`**`,
        footer: {
            text: `Game will expire in ${waitingTime / 60} minutes`
        }
    });
    const row = new discord_js_1.MessageActionRow()
        .addComponents(new discord_js_1.MessageButton()
        .setCustomId('join-rps')
        .setLabel('Join')
        .setStyle('SUCCESS'));
    yield interaction.editReply({ embeds: [embed], components: [row] });
    const filter = (btn) => {
        return (btn.user.id == against.id || btn.user.id == interaction.user.id)
            && msg.id == btn.message.id;
    };
    const rivalCollector = (_f = interaction.channel) === null || _f === void 0 ? void 0 : _f.createMessageComponentCollector({
        filter, time: waitingTime * 1000
    });
    rivalCollector === null || rivalCollector === void 0 ? void 0 : rivalCollector.on('collect', (btn) => __awaiter(void 0, void 0, void 0, function* () {
        var _g;
        yield btn.deferUpdate();
        if (btn.customId !== 'join-rps')
            return;
        if (btn.user.id !== against.id)
            return;
        yield sendController(bet, interaction, against);
        rivalCollector.stop();
        const responseCollector = (_g = interaction.channel) === null || _g === void 0 ? void 0 : _g.createMessageComponentCollector({
            filter, time: responseTime * 1000
        });
        let done = false;
        responseCollector === null || responseCollector === void 0 ? void 0 : responseCollector.on('collect', (btn) => __awaiter(void 0, void 0, void 0, function* () {
            if (!btn.customId.startsWith('rps'))
                return;
            if (!Games[msg.id])
                Games[msg.id] = {};
            if (!Games[msg.id][btn.user.id])
                Games[msg.id][btn.user.id] = btn.customId.split('-')[1];
            if (Object.keys(Games[msg.id]).length !== 2)
                return;
            done = true;
            const winIndex = winner(Object.values(Games[msg.id]));
            const emojiMap = { 'r': emojis_json_1.rock, 'p': emojis_json_1.paper, 's': emojis_json_1.scissors };
            const emojiResponse = Object.values(Games[msg.id]).map(resp => emojiMap[resp]);
            yield sendController(bet, interaction, against, emojiResponse, Object.keys(Games[msg.id]), winIndex);
            if (winIndex == -1)
                return;
            const winId = Object.keys(Games[msg.id])[winIndex];
            yield assignCurrency_1.default.fame(winId, 'games', (bet * 0.7));
            yield assignCurrency_1.default.spend.fame(Object.keys(Games[msg.id])[winIndex == 0 ? 1 : 0], fame);
            yield (0, updateDb_1.default)({ id: interaction.user.id }, 'games.rps', Date.now());
            yield (0, updateDb_1.default)({ id: winId }, 'games.won', (prev) => prev.games.won + 1);
        }));
        responseCollector === null || responseCollector === void 0 ? void 0 : responseCollector.on('end', () => __awaiter(void 0, void 0, void 0, function* () {
            delete Games[msg.id];
            if (done)
                return;
            yield interaction.editReply({
                content: `${emojis_json_1.clock} Game Timedout`,
                embeds: [],
                components: []
            });
        }));
    }));
    rivalCollector === null || rivalCollector === void 0 ? void 0 : rivalCollector.on('end', (coll) => __awaiter(void 0, void 0, void 0, function* () {
        if (coll.toJSON().find(btn => btn.user.id == against.id))
            return;
        yield interaction.editReply({
            content: `${emojis_json_1.clock} Waiting Timedout`,
            embeds: [],
            components: []
        });
    }));
});
function sendController(bet, interaction, against, res = [], users = [], won = -2) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const embed = new discord_js_1.MessageEmbed({
            title: `${emojis_json_1.game} Rock Paper Scissors`,
            description: `**Pool: \`${bet} Fame\`**\n\n**${interaction.user.username}:** *...choosing*\n**${against.username}:** *...choosing*`,
            thumbnail: { url: (_a = server_1.default.user) === null || _a === void 0 ? void 0 : _a.displayAvatarURL() },
            footer: {
                text: `Choose in next ${responseTime} seconds`
            }
        });
        let row = new discord_js_1.MessageActionRow()
            .addComponents(new discord_js_1.MessageButton()
            .setCustomId('rps-r')
            .setEmoji(emojis_json_1.rock)
            .setStyle('PRIMARY'))
            .addComponents(new discord_js_1.MessageButton()
            .setCustomId('rps-p')
            .setEmoji(emojis_json_1.paper)
            .setStyle('PRIMARY'))
            .addComponents(new discord_js_1.MessageButton()
            .setCustomId('rps-s')
            .setEmoji(emojis_json_1.scissors)
            .setStyle('PRIMARY'));
        let attachment;
        let picUrl;
        if (won >= 0) {
            const winnImg = interaction.user.id == users[won]
                ? interaction.user.displayAvatarURL()
                : against.displayAvatarURL();
            const looseImg = interaction.user.id != users[won]
                ? interaction.user.displayAvatarURL()
                : against.displayAvatarURL();
            picUrl = yield shameImage(winnImg, looseImg, interaction.id);
            attachment = new discord_js_1.MessageAttachment(picUrl, `favicon.png`);
            embed.thumbnail = { url: "attachment://favicon.png" };
        }
        if (won !== -2) {
            const firstIndex = users.indexOf(interaction.user.id);
            const secondIndex = firstIndex == 0 ? 1 : 0;
            const looseIndex = won > -1 ? (won == 0 ? 1 : 0) : -1;
            embed.description = `**Pool: \`${bet} Fame\`**\n`
                + `\n**${interaction.user.username}:** ${res[firstIndex]}\n**${against.username}:** ${res[secondIndex]}\n\n`
                + `${won > -1 ? `<@${users[won]}> **Won ${emojis_json_1.party}**` : 'Its a **Tie**'}`
                + (won > -1 ? `\n\n${emojis_json_1.earning} <@${users[won]}> won **${bet * 0.7} Fame**\n${emojis_json_1.money} <@${users[looseIndex]}> lost **${bet / 2} Fame**`
                    : '');
            embed.footer = { text: `${res[firstIndex]} vs ${res[secondIndex]}` };
        }
        yield interaction.editReply({
            embeds: [embed],
            components: won == -2 ? [row] : [],
            files: attachment ? [attachment] : []
        });
        if (picUrl)
            yield promises_1.default.rm(picUrl);
    });
}
function winner(res) {
    if (res[0] == 'r') {
        if (res[1] == 'p')
            return 1;
        else if (res[1] == 's')
            return 0;
        else
            return -1;
    }
    else if (res[0] == 'p') {
        if (res[1] == 'r')
            return 0;
        else if (res[1] == 's')
            return 1;
        else
            return -1;
    }
    else {
        if (res[1] == 'r')
            return 1;
        else if (res[1] == 'p')
            return 0;
        else
            return -1;
    }
}
function shameImage(_winner, _looser, id) {
    return __awaiter(this, void 0, void 0, function* () {
        let parent = yield jimp_1.default.read('./assets/shame.jpg');
        parent = parent.resize(128, 128);
        let winner = yield jimp_1.default.read(_winner.replace('webp', 'jpg'));
        winner = winner.resize(30, 30);
        let looser = yield jimp_1.default.read(_looser.replace('webp', 'jpg'));
        looser = looser.resize(30, 30).rotate(-80);
        parent.composite(winner, 10, 2, {
            mode: jimp_1.default.BLEND_SOURCE_OVER,
            opacityDest: 1,
            opacitySource: 1
        });
        parent.composite(looser, 95, 65, {
            mode: jimp_1.default.BLEND_SOURCE_OVER,
            opacityDest: 1,
            opacitySource: 1
        });
        yield parent.writeAsync(`./assets/${id}.jpg`);
        return `./assets/${id}.jpg`;
    });
}
