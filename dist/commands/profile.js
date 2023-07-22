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
const emojis_json_1 = __importDefault(require("../data/emojis.json"));
const impVar_json_1 = require("../data/impVar.json");
const jimp_1 = __importDefault(require("jimp"));
const fs_1 = __importDefault(require("fs"));
const nitroAdrs = './assets/nitro.png';
exports.default = (args) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
    const interaction = args.Interaction;
    const show = interaction.options.getBoolean("show");
    const user = yield User_js_1.default.findOne({ id: interaction.user.id });
    if (!user) {
        yield interaction.reply({
            content: 'You are not registered, use `/register`',
            ephemeral: true
        });
        return;
    }
    const member = yield (yield server_js_1.default.guilds.fetch(impVar_json_1.TAISHOKU_SERVER_ID)).members.fetch(user.id);
    let dpExists = member.displayAvatarURL() ? true : false;
    let imageUrl = '';
    let nitroRole = member.roles.cache.toJSON().find(role => role.name == 'Server Booster');
    let attachement;
    let locationImg;
    if (dpExists) {
        if (nitroRole) {
            imageUrl = yield imageOverlay(member.displayAvatarURL(), nitroAdrs, member.id);
            attachement = new discord_js_1.MessageAttachment(imageUrl, 'favicon.png');
            locationImg = imageUrl;
            imageUrl = "attachment://favicon.png";
        }
        else
            imageUrl = member.displayAvatarURL();
    }
    const nickname = member.nickname ? `\n**Nickname:** ${member.nickname}\n` : '';
    const embed = new discord_js_1.MessageEmbed({
        title: `${emojis_json_1.default.profile} ${member === null || member === void 0 ? void 0 : member.user.username}`,
        description: `**Username:** ${member === null || member === void 0 ? void 0 : member.user.username},${nickname}
**Since:** ${(new Date((_a = user.started) !== null && _a !== void 0 ? _a : "")).toString().replace(/GMT\+[0-9]+ \([A-Z a-z]+\)/g, '')}`,
        fields: [
            {
                name: `${emojis_json_1.default.earning} Balance`,
                value: `**Fame:** **\`${user.totalFame.toFixed(2)}\`**
**Elixir:** **\`${user.totalElixir.toFixed(2)}\`**`,
                inline: false,
            }, {
                name: `${emojis_json_1.default.money} Earnings`,
                value: `**Missions:** **\`${(_b = user.missions) === null || _b === void 0 ? void 0 : _b.fameCollected.toFixed(2)}F\`  \`${(_c = user.missions) === null || _c === void 0 ? void 0 : _c.elixirCollected.toFixed(2)}E\`**
**Roles:** **\`${(_d = user.roles) === null || _d === void 0 ? void 0 : _d.fameCollected.toFixed(2)}F\`  \`${(_e = user.roles) === null || _e === void 0 ? void 0 : _e.elixirCollected.toFixed(2)}E\`**
**Games:** **\`${(_f = user.games) === null || _f === void 0 ? void 0 : _f.fameCollected.toFixed(2)}F\`  \`${(_g = user.chat) === null || _g === void 0 ? void 0 : _g.elixirCollected.toFixed(2)}E\`**
**Chat:** **\`${(_h = user.chat) === null || _h === void 0 ? void 0 : _h.fameCollected.toFixed(2)}F\`  \`${(_j = user.chat) === null || _j === void 0 ? void 0 : _j.elixirCollected.toFixed(2)}E\`**
**Events:** **\`${(_k = user.events) === null || _k === void 0 ? void 0 : _k.fameCollected.toFixed(2)}F\`  \`${(_l = user.events) === null || _l === void 0 ? void 0 : _l.elixirCollected.toFixed(2)}E\`**
**Nitro:** **\`${(_m = user.nitro) === null || _m === void 0 ? void 0 : _m.fameCollected.toFixed(2)}F\`  \`${(_o = user.nitro) === null || _o === void 0 ? void 0 : _o.elixirCollected.toFixed(2)}E\`**
**Ramen:** **\`${(_p = user.ramen) === null || _p === void 0 ? void 0 : _p.fameCollected.toFixed(2)}F\`  \`${(_q = user.ramen) === null || _q === void 0 ? void 0 : _q.elixirCollected.toFixed(2)}E\`**
**NoRoot:** **\`${(_r = user.noroot) === null || _r === void 0 ? void 0 : _r.fameCollected.toFixed(2)}F\`  \`${(_s = user.noroot) === null || _s === void 0 ? void 0 : _s.elixirCollected.toFixed(2)}E\`**`,
                inline: true
            }, {
                name: `${emojis_json_1.default.spending} Spendings`,
                value: `**Fame:** **\`${(_t = user.spent) === null || _t === void 0 ? void 0 : _t.fameCollected.toFixed(2)}\`**\n**Elixir:** **\`${(_u = user.spent) === null || _u === void 0 ? void 0 : _u.elixirCollected.toFixed(2)}\`**`,
                inline: true
            }, {
                name: `${emojis_json_1.default.showcase} Showcase`,
                value: `**Missions Completed:** **\`${(_v = user.missions) === null || _v === void 0 ? void 0 : _v.missionsCompleted}\`**
**Games Won:** **\`${(_w = user.games) === null || _w === void 0 ? void 0 : _w.won} times\`**
**Missions:** **\`${(_x = user.missions) === null || _x === void 0 ? void 0 : _x.missionsCompleted} times\`**
**Server Boosts:** **\`${(_y = user.nitro) === null || _y === void 0 ? void 0 : _y.boosts} times\`**
**Nitro Earned:** **\`${(_z = user.nitro) === null || _z === void 0 ? void 0 : _z.purchased} times\`**
**Ramen Voted:** **\`${(_0 = user.ramen) === null || _0 === void 0 ? void 0 : _0.votes} times\`**`
            }
        ]
    });
    if (dpExists) {
        embed.thumbnail = {
            url: imageUrl
        };
    }
    if (!attachement) {
        yield interaction.reply({
            embeds: [embed],
            ephemeral: show ? false : true
        });
    }
    else {
        yield interaction.reply({
            embeds: [embed],
            files: [attachement],
            ephemeral: show ? false : true
        });
        if (locationImg)
            fs_1.default.rm(locationImg, (e) => e ? console.log(e) : null);
    }
});
function imageOverlay(originalImage, imageOverlay, id) {
    return __awaiter(this, void 0, void 0, function* () {
        originalImage = originalImage.replace('webp', 'jpg');
        let watermark = yield jimp_1.default.read(imageOverlay);
        watermark = watermark.resize(50, 50);
        let image = yield jimp_1.default.read(originalImage);
        image = image.resize(128, 128);
        image.composite(watermark, 85, 80, {
            mode: jimp_1.default.BLEND_SOURCE_OVER,
            opacityDest: 1,
            opacitySource: 1
        });
        yield image.writeAsync(`./assets/${id}.jpg`);
        return `./assets/${id}.jpg`;
    });
}
