import client from "../server";
import { TAISHOKU_SERVER_ID } from '../data/impVar.json'
import { ColorResolvable, CommandInteraction, EmbedField, GuildMember, MessageEmbed, MessageEmbedFooter, ModalSubmitInteraction } from "discord.js";
import Users from "../schema/User";
import { FieldsArray, Shop, StdObject } from "../types";
import { money } from '../data/emojis.json';

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
}

export async function getUsersByRole (roleId:string, ignoreById:string[]=[], ignoreBots=true) {

    const server = await client.guilds.fetch(TAISHOKU_SERVER_ID);

    let memberCount = 0;
    let members:GuildMember[] = [];

    for (let member of (await server.members.fetch()).toJSON()) {
        if (ignoreBots) if (member.user.bot) continue;
        if (ignoreById.includes(member.id)) continue;

        if (member.roles.cache.map(role => role.id).includes(roleId)) {
            memberCount += 1;
            members.push(member)
        }
    };

    return {
        memberCount, 
        members
    }
}

export async function registerGamesIfNot(id:string) {
    const user = await Users.findOne({ id });
    if (!user) return;
    user.games = {
        won: 0,
        fameCollected: 0,
        coinflip: '0',
        elixirCollected: 0
    }
    return user.save();
}

export async function isUserOrRole(roleId:string) {

    const server = await client.guilds.fetch(TAISHOKU_SERVER_ID);

    let targetType:'user'|'role';
    try {
        await server.members.fetch(roleId);
        targetType = 'user';
    } catch (e) {
        targetType = 'role';
    }
    return targetType;
}

export function timeRange(from:string|undefined, till:string|number|undefined=Date.now()) {
    till = +till;
    const deltaTime = till - +(from??0);

    const oneDay = 24 * 60 * 60 * 1000;
    return {
        seconds: deltaTime / 1000,
        minutes: deltaTime / (1000 * 60),
        hours: deltaTime / (1000 * 60* 60),
        days: deltaTime / oneDay,
        months: deltaTime / (oneDay * 30),
        years: deltaTime / (oneDay * 365),
        deltaTime,
        
        dayLiteral: (deltaTime / oneDay) < 1 ? "less than a day" 
                    : Math.floor((deltaTime / oneDay)) + 
                    ` day${Math.floor(deltaTime / oneDay) > 1 ? 's' : ''}`
    }
}

export function generateReceipt(user:any, item:Shop, interaction:CommandInteraction|ModalSubmitInteraction, purchaseId:string) {
    return new MessageEmbed({
        title: `${money} PURCHASE RECEIPT`,
        thumbnail: { url: client.user?.displayAvatarURL() },
        description: `**Customer:** <@${user.id}>\n**Amount:** \`${item.price}F\`\n**Item:** ${item.name}\n**Purchase Id:** \`${purchaseId}\``,
        footer: {
            text: `${interaction.createdAt.toString().replace(/\([A-Z a-z]+\)/g, '')}`,
            iconURL: interaction.user.displayAvatarURL()
        }
    });
}



// experimental
export function embedBuilder(string:string) {
    let title = string.match(regx.title);
    let desc = string.match(regx.desc);
    let fields = string.match(regx.fields);
    let foot = string.match(regx.foot);
    let thumb = string.match(regx.thumb);
    let color = string.match(regx.color);

    if (!title) return;
    const embed = new MessageEmbed();
    embed.title = extractFromMarkup(title[0], 'title').trim();

    if (desc) embed.description = extractFromMarkup(desc[0], 'desc', '\n');
    if (fields) {
        const innerText:string = extractFromMarkup(fields[0], 'fields');
        const fieldsObject:EmbedField[] = [];
        const fieldsArr = innerText.split(',');

        for (let field of fieldsArr) {
            let isInline = false;
            field = field.trim();
            if (!field) continue;
            console.log(field + '\n')

            if (field.includes('##inline')) {
                field = field.replace('##inline', '');
                isInline = true;
            }

            let nameReg = field.match(regx.fieldName);
            if (!nameReg) continue;
            const name = nameReg[0].split('"')[1].trim();

            let valueReg = field.match(regx.fieldValue);
            if (!valueReg) continue;
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
        `
        const innerText:string = extractFromMarkup(foot[0], 'foot');
        let footerObject:MessageEmbedFooter = { 'text': '' };

        for (let footer of innerText.split(',')) {
            if (!footer.trim()) continue;

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
        const innerText:string = extractFromMarkup(thumb[0], 'thumb');
        embed.thumbnail = { url: innerText.trim() };
    }
    if (color) {
        const innerText:ColorResolvable = extractFromMarkup(color[0], 'color').trim();
        embed.setColor(innerText);
    }

    return embed;
}

function extractFromMarkup(string:string, tag:string, newL=''):any {
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
`

// console.log(embedBuilder(string), 'here');