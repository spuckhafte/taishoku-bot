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
const User_1 = __importDefault(require("../../schema/User"));
const emojis_json_1 = require("../../data/emojis.json");
const money_json_1 = require("../../data/money.json");
const toolbox_1 = require("../toolbox");
const timings_json_1 = __importDefault(require("../../data/timings.json"));
const updateDb_1 = __importDefault(require("../updateDb"));
const assignCurrency_1 = __importDefault(require("../assignCurrency"));
const index = {
    'dollar': '1',
    'euro': '2'
};
exports.default = (fame, interaction) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    yield interaction.deferReply();
    let user = yield User_1.default.findOne({ id: interaction.user.id });
    if (!user) {
        interaction.editReply({
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
    let last = (_c = user.games) === null || _c === void 0 ? void 0 : _c.coinflip;
    if (!last)
        last = '0';
    if (timings_json_1.default.coinflip * 1000 > (+Date.now() - +last)) {
        yield interaction.editReply({
            content: `Wait for \`${(15 - (0, toolbox_1.timeRange)(`${last}`, Date.now()).minutes).toFixed(2)}\` minutes`
        });
        return;
    }
    if (user.totalFame < fame) {
        yield interaction.editReply({
            content: `You can't bet on that, check your balance`
        });
        return;
    }
    if (fame <= 0) {
        yield interaction.editReply({
            content: `Invalid Amount`,
        });
        return;
    }
    if (!interaction.channel)
        return;
    const btns = new discord_js_1.MessageActionRow()
        .addComponents(new discord_js_1.MessageButton()
        .setCustomId('dollar')
        .setLabel('Dollar')
        .setStyle('PRIMARY'))
        .addComponents(new discord_js_1.MessageButton()
        .setCustomId('euro')
        .setLabel('Euro')
        .setStyle('PRIMARY'));
    const msg = yield interaction.editReply({
        components: [btns]
    });
    const filter = (btn) => {
        return btn.user.id == interaction.user.id && msg.id == btn.message.id;
    };
    const collector = interaction.channel.createMessageComponentCollector({
        filter, max: 1
    });
    collector.on('collect', (btn) => __awaiter(void 0, void 0, void 0, function* () {
        var _d;
        btn.deferUpdate();
        const choice = btn.customId;
        const coinToss = ['dollar', 'euro'][Math.floor(Math.random() * ['dollar', 'euro'].length)];
        if (coinToss != 'dollar' && coinToss != 'euro')
            return;
        const win = choice == coinToss ? true : false;
        const loop = index[coinToss];
        const bet = +((money_json_1.rewards.coinFlip / 100) * fame).toFixed(2);
        yield (0, updateDb_1.default)({ id: interaction.user.id }, 'games.coinflip', Date.now());
        if (win) {
            yield assignCurrency_1.default.fame(interaction.user.id, 'games', bet);
            if (user && user.games)
                yield (0, updateDb_1.default)({ id: interaction.user.id }, 'games.won', ((_d = user === null || user === void 0 ? void 0 : user.games) === null || _d === void 0 ? void 0 : _d.won) + 1);
        }
        else
            yield assignCurrency_1.default.spend.fame(interaction.user.id, fame);
        if (loop != '1' && loop != '2')
            return;
        yield animation(loop, interaction, win, choice, coinToss, win ? bet : fame);
    }));
});
function animation(loop, inter, win, choice, coin, bet) {
    return __awaiter(this, void 0, void 0, function* () {
        const phase = ['a', 'b', 'c', 'd', 'e', 'f'];
        for (let i of phase) {
            let url = i == 'f' ? `loop${loop}` : `loop-${i}`;
            const { embed, coinImg } = generateEmbed(url, choice);
            if (i == 'f') {
                embed.description = `Your choice: **${choice.toUpperCase()}**\nCoin flipped to: **${coin.toUpperCase()}**\n\n${win ? '**You Win**' : '**You Loose**'}`,
                    embed.footer = {
                        text: `${win ? '+' : '-'}${bet} Fame`,
                        iconURL: inter.user.displayAvatarURL()
                    };
                yield inter.editReply({ embeds: [embed], files: [coinImg], components: [] });
            }
            else
                yield inter.editReply({ embeds: [embed], files: [coinImg], components: [] });
            yield sleep(900);
        }
    });
}
function generateEmbed(imageUrl, choice) {
    const embed = new discord_js_1.MessageEmbed({
        title: `${emojis_json_1.game} Coinflip`,
        description: `Your choice: **${choice.toUpperCase()}**\n*The coin is flipping*`
    });
    const coinImg = new discord_js_1.MessageAttachment(`assets/coinflip/${imageUrl}.png`, 'favicon.png');
    embed.thumbnail = { url: 'attachment://favicon.png' };
    return { embed, coinImg };
}
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        yield new Promise(resolve => setTimeout(resolve, ms));
    });
}
