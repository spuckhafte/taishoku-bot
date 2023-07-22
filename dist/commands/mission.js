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
const updateDb_js_1 = __importDefault(require("../helpers/updateDb.js"));
const User_js_1 = __importDefault(require("../schema/User.js"));
const toolbox_js_1 = require("../helpers/toolbox.js");
const missions_json_1 = __importDefault(require("../data/missions.json"));
const emojis_json_1 = require("../data/emojis.json");
const settings_json_1 = require("../data/settings.json");
const money_json_1 = require("../data/money.json");
const timings_json_1 = __importDefault(require("../data/timings.json"));
const emojiOpts = { 1: emojis_json_1.one, 2: emojis_json_1.two, 3: emojis_json_1.three };
exports.default = (args) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const interaction = args.Interaction;
    const mission = missions_json_1.default[Math.floor(Math.random() * missions_json_1.default.length)];
    const user = yield User_js_1.default.findOne({ id: interaction.user.id });
    if (!user) {
        yield interaction.reply({
            content: 'You are not registered, use `/register`',
            ephemeral: true
        });
        return;
    }
    let last = ((_a = user.missions) === null || _a === void 0 ? void 0 : _a.lastMission) ? (_b = user.missions) === null || _b === void 0 ? void 0 : _b.lastMission : 0;
    if (timings_json_1.default.mission * 1000 > (+Date.now() - +last)) {
        yield interaction.reply({
            content: `Wait for \`${(120 - (0, toolbox_js_1.timeRange)(`${last}`, Date.now()).minutes).toFixed(2)}\` minutes`,
            ephemeral: true
        });
        return;
    }
    yield (0, updateDb_js_1.default)({ id: user.id }, 'missions.lastMission', Date.now());
    const embed = new discord_js_1.MessageEmbed({
        title: `${emojis_json_1.showcase} Mission`,
        description: `**${mission.question}**\n${optionsText(mission.options)}`,
        footer: {
            text: `You have ${settings_json_1.missionTiming} seconds`,
            iconURL: interaction.user.displayAvatarURL()
        },
        thumbnail: { url: (_c = server_js_1.default.user) === null || _c === void 0 ? void 0 : _c.displayAvatarURL() }
    });
    const row = generateOptionButtons(mission);
    const msg = yield interaction.reply({ embeds: [embed], components: [row], fetchReply: true });
    const filter = (btn) => {
        return btn.user.id == interaction.user.id && msg.id == btn.message.id;
    };
    const timeout = setTimeout(() => {
        embed.footer.text = `${emojis_json_1.clock} Times up`;
        const rowNew = generateOptionButtons(mission, true, false, true);
        interaction.editReply({
            embeds: [embed],
            components: [rowNew]
        });
    }, settings_json_1.missionTiming * 1000);
    const collector = (_d = interaction.channel) === null || _d === void 0 ? void 0 : _d.createMessageComponentCollector({
        filter, time: settings_json_1.missionTiming * 1000, max: 1
    });
    collector === null || collector === void 0 ? void 0 : collector.on('collect', (collected) => __awaiter(void 0, void 0, void 0, function* () {
        var _e, _f, _g, _h;
        collected.deferUpdate();
        clearTimeout(timeout);
        const correct = collected.customId.includes('correct');
        const optionSelected = +collected.customId.replace(/correct|wrong/g, '');
        if (correct) {
            yield assignCurrency_js_1.default.fame(interaction.user.id, 'missions', money_json_1.rewards.mission);
            (_e = embed.footer) === null || _e === void 0 ? void 0 : _e.text = `Correct, +${money_json_1.rewards.mission} Fame`;
            let prevMissions = ((_f = user.missions) === null || _f === void 0 ? void 0 : _f.missionsCompleted) ? user.missions.missionsCompleted : 0;
            yield (0, updateDb_js_1.default)({ id: user.id }, 'missions.missionsCompleted', prevMissions + 1);
        }
        else {
            yield assignCurrency_js_1.default.spend.fame(interaction.user.id, 5);
            (_g = embed.footer) === null || _g === void 0 ? void 0 : _g.text = `${emojis_json_1.wrong} Incorrect, -5 Fame`;
            let prevMissions = ((_h = user.missions) === null || _h === void 0 ? void 0 : _h.missionsCompleted) ? user.missions.missionsCompleted : 0;
            yield (0, updateDb_js_1.default)({ id: user.id }, 'missions.missionsCompleted', prevMissions + 1);
        }
        const rowNew = generateOptionButtons(mission, true, correct, false, optionSelected);
        interaction.editReply({ embeds: [embed], components: [rowNew] });
    }));
});
function generateOptionButtons(mission, disabled = false, won = false, timeout = false, choice = mission.correct) {
    const row = new discord_js_1.MessageActionRow();
    for (let opt_i in mission.options) {
        row.addComponents(new discord_js_1.MessageButton()
            .setCustomId(+opt_i == mission.correct ? `correct${opt_i}` : `wrong${opt_i}`)
            .setEmoji(emojiOpts[+opt_i + 1])
            .setStyle(disabled && !timeout ? (+opt_i == choice ? (won ? 'SUCCESS' : 'DANGER') : 'SECONDARY') : 'SECONDARY')
            .setDisabled(disabled));
    }
    return row;
}
function optionsText(options) {
    let string = '';
    for (let opt_i in options) {
        const opt = options[opt_i];
        string += `**${emojiOpts[+opt_i + 1]}** ${opt}\n`;
    }
    return string;
}
