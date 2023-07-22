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
exports.embedBuilder = exports.generateReceipt = exports.timeRange = exports.isUserOrRole = exports.registerGamesIfNot = exports.getUsersByRole = void 0;
const server_js_1 = __importDefault(require("../server.js"));
const impVar_json_1 = require("../data/impVar.json");
const discord_js_1 = require("discord.js");
const User_js_1 = __importDefault(require("../schema/User.js"));
const emojis_json_1 = require("../data/emojis.json");
const regx = {
    title: /<title>[a-zA-Z0-9*/\\&^$#@!:"'.#_{}()[\]\-, ]+<\/title>/g,
    desc: /<desc>[a-zA-Z0-9*/\\&^$#@!:"'.#_{}()[\]\-, \n]+<\/desc>/g,
    fields: /<fields>[a-zA-Z0-9*/\\&^$#@!:"'.#_{}()[\]\-, \n]+<\/fields>/g,
    foot: /<foot>[a-zA-Z0-9*/\\&^$#@!:"'.#_{}()[\]\-, \n]+<\/foot>/g,
    thumb: /<thumb>[a-zA-Z0-9*/\\&^$#@!:"'.#_{}()[\]\-, \n]+<\/thumb>/g,
    color: /<color>[a-zA-Z0-9*/\\&^$#@!:"'.#_{}()[\]\-, \n]+<\/color>/g,
    startNewL: /^\n+/g,
    endNewL: /\n+$/g,
    fieldName: /^"(.*)+"([ ]|)+-/g,
    fieldValue: /-([ ]|)+"(.*)"/g
};
function getUsersByRole(roleId, ignoreById = [], ignoreBots = true) {
    return __awaiter(this, void 0, void 0, function* () {
        const server = yield server_js_1.default.guilds.fetch(impVar_json_1.TAISHOKU_SERVER_ID);
        let memberCount = 0;
        let members = [];
        for (let member of (yield server.members.fetch()).toJSON()) {
            if (ignoreBots)
                if (member.user.bot)
                    continue;
            if (ignoreById.includes(member.id))
                continue;
            if (member.roles.cache.map(role => role.id).includes(roleId)) {
                memberCount += 1;
                members.push(member);
            }
        }
        ;
        return {
            memberCount,
            members
        };
    });
}
exports.getUsersByRole = getUsersByRole;
function registerGamesIfNot(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield User_js_1.default.findOne({ id });
        if (!user)
            return;
        user.games = {
            won: 0,
            fameCollected: 0,
            coinflip: '0',
            rps: '0',
            elixirCollected: 0
        };
        return user.save();
    });
}
exports.registerGamesIfNot = registerGamesIfNot;
function isUserOrRole(roleId) {
    return __awaiter(this, void 0, void 0, function* () {
        const server = yield server_js_1.default.guilds.fetch(impVar_json_1.TAISHOKU_SERVER_ID);
        let targetType;
        try {
            yield server.members.fetch(roleId);
            targetType = 'user';
        }
        catch (e) {
            targetType = 'role';
        }
        return targetType;
    });
}
exports.isUserOrRole = isUserOrRole;
function timeRange(from, till = Date.now()) {
    till = +till;
    const deltaTime = till - +(from !== null && from !== void 0 ? from : 0);
    const oneDay = 24 * 60 * 60 * 1000;
    return {
        ms: deltaTime,
        seconds: deltaTime / 1000,
        minutes: deltaTime / (1000 * 60),
        hours: deltaTime / (1000 * 60 * 60),
        days: deltaTime / oneDay,
        months: deltaTime / (oneDay * 30),
        years: deltaTime / (oneDay * 365),
        deltaTime,
        dayLiteral: (deltaTime / oneDay) < 1 ? "less than a day"
            : Math.floor((deltaTime / oneDay)) +
                ` day${Math.floor(deltaTime / oneDay) > 1 ? 's' : ''}`
    };
}
exports.timeRange = timeRange;
function generateReceipt(user, item, interaction, purchaseId) {
    var _a;
    return new discord_js_1.MessageEmbed({
        title: `${emojis_json_1.money} PURCHASE RECEIPT`,
        thumbnail: { url: (_a = server_js_1.default.user) === null || _a === void 0 ? void 0 : _a.displayAvatarURL() },
        description: `**Customer:** <@${user.id}>\n**Amount:** \`${item.price}F\`\n**Item:** ${item.name}\n**Purchase Id:** \`${purchaseId}\``,
        footer: {
            text: `${interaction.createdAt.toString().replace(/\([A-Z a-z]+\)/g, '')}`,
            iconURL: interaction.user.displayAvatarURL()
        }
    });
}
exports.generateReceipt = generateReceipt;
function embedBuilder(string) {
    let title = string.match(regx.title);
    let desc = string.match(regx.desc);
    let fields = string.match(regx.fields);
    let foot = string.match(regx.foot);
    let thumb = string.match(regx.thumb);
    let color = string.match(regx.color);
    if (!title)
        return;
    const embed = new discord_js_1.MessageEmbed();
    embed.title = extractFromMarkup(title[0], 'title').trim();
    if (desc)
        embed.description = extractFromMarkup(desc[0], 'desc', '\n');
    if (fields) {
        const innerText = extractFromMarkup(fields[0], 'fields');
        const fieldsObject = [];
        const fieldsArr = innerText.split(',');
        for (let field of fieldsArr) {
            let isInline = false;
            field = field.trim();
            if (!field)
                continue;
            console.log(field + '\n');
            if (field.includes('##inline')) {
                field = field.replace('##inline', '');
                isInline = true;
            }
            let nameReg = field.match(regx.fieldName);
            if (!nameReg)
                continue;
            const name = nameReg[0].split('"')[1].trim();
            let valueReg = field.match(regx.fieldValue);
            if (!valueReg)
                continue;
            const value = valueReg[0].split('"')[1].trim();
            fieldsObject.push({
                name, value, inline: isInline
            });
        }
        console.log(fieldsObject);
        embed.fields = fieldsObject;
    }
    if (foot) {
        `
        <foot>
            ~text >> "sdffskdfsdf",
            ~url >> "https://ffff"
        </foot>
        `;
        const innerText = extractFromMarkup(foot[0], 'foot');
        let footerObject = { 'text': '' };
        for (let footer of innerText.split(',')) {
            if (!footer.trim())
                continue;
            let text = footer.split('~text')[1].split('>>')[1].trim();
            footerObject['text'] = text;
            if (footer.includes('~url')) {
                let url = footer.split('~url')[1].split('>>')[1].trim();
                footerObject['iconURL'] = url;
            }
        }
        embed.footer = footerObject;
    }
    if (thumb) {
        const innerText = extractFromMarkup(thumb[0], 'thumb');
        embed.thumbnail = { url: innerText.trim() };
    }
    if (color) {
        const innerText = extractFromMarkup(color[0], 'color').trim();
        embed.setColor(innerText);
    }
    return embed;
}
exports.embedBuilder = embedBuilder;
function extractFromMarkup(string, tag, newL = '') {
    return string.split(`<${tag}>`)[1].split(`</${tag}>`)[0]
        .replace(regx.startNewL, newL)
        .replace(regx.endNewL, newL);
}
let string = `
<title> Test Embed </title>

<desc>
    This is a test embed.
    Ig it is good
</desc>

<fields>
    "name" - "field1 is **best** I love field 1
              it is the best in the world",
    "name2" - "i love
               ass" ##inline,
    "name3" - "oh my god"
</fields>

<foot>
    ~text: "I love ass and everything else
</foot>

<color> RANDOM </color>
`;
