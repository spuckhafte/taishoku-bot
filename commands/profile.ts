import { MessageAttachment, MessageEmbed } from "discord.js";
import Users from "../schema/User";
import client from "../server";
import { CmdoArgs } from "../types";
import emojis from '../data/emojis.json';
import { TAISHOKU_SERVER_ID } from '../data/impVar.json'
import Jimp from "jimp";
import fs from 'fs';

const nitroAdrs = './assets/nitro.png';

export default async (args:CmdoArgs) => {
    const interaction = args.Interaction;
    const show = interaction.options.getBoolean("show");
    const user = await Users.findOne({ id: interaction.user.id });
    if (!user) {
        await interaction.reply({
            content: 'You are not registered, use `/register`',
            ephemeral: true
        });
        return;
    }
    const member = await (await client.guilds.fetch(TAISHOKU_SERVER_ID)).members.fetch(user.id);

    let dpExists = member.displayAvatarURL() ? true : false;

    let imageUrl:string = '';
    let nitroRole = member.roles.cache.toJSON().find(role => role.name == 'Server Booster');
    let attachement;
    let locationImg;

    if (dpExists) {
        if (nitroRole) {
            imageUrl = await imageOverlay(member.displayAvatarURL(), nitroAdrs, member.id);
            attachement = new MessageAttachment(imageUrl, 'favicon.png');
            locationImg = imageUrl
            imageUrl = "attachment://favicon.png";
        }
        else imageUrl = member.displayAvatarURL();
    }

    const nickname = member.nickname ? `\n**Nickname:** ${member.nickname}\n` : ''

    const embed = new MessageEmbed({
        title: `${emojis.profile} ${member?.user.username}`,
        description: `**Username:** ${member?.user.username},${nickname}
**Since:** ${(new Date(user.started ?? "")).toString().replace(/GMT\+[0-9]+ \([A-Z a-z]+\)/g, '')}`,
        fields: [
            {
                name: `${emojis.earning} Balance`,
                value: `**Fame:** **\`${user.totalFame.toFixed(2)}\`**
**Elixir:** **\`${user.totalElixir.toFixed(2)}\`**`,
                inline: false,
            }, {
                name: `${emojis.money} Earnings`,
                value: `**Missions:** **\`${user.missions?.fameCollected.toFixed(2)}F\`  \`${user.missions?.elixirCollected.toFixed(2)}E\`**
**Roles:** **\`${user.roles?.fameCollected.toFixed(2)}F\`  \`${user.roles?.elixirCollected.toFixed(2)}E\`**
**Games:** **\`${user.games?.fameCollected.toFixed(2)}F\`  \`${user.chat?.elixirCollected.toFixed(2)}E\`**
**Chat:** **\`${user.chat?.fameCollected.toFixed(2)}F\`  \`${user.chat?.elixirCollected.toFixed(2)}E\`**
**Events:** **\`${user.events?.fameCollected.toFixed(2)}F\`  \`${user.events?.elixirCollected.toFixed(2)}E\`**
**Nitro:** **\`${user.nitro?.fameCollected.toFixed(2)}F\`  \`${user.nitro?.elixirCollected.toFixed(2)}E\`**
**Ramen:** **\`${user.ramen?.fameCollected.toFixed(2)}F\`  \`${user.ramen?.elixirCollected.toFixed(2)}E\`**
**NoRoot:** **\`${user.noroot?.fameCollected.toFixed(2)}F\`  \`${user.noroot?.elixirCollected.toFixed(2)}E\`**`,
                inline: true
            }, {
                name: `${emojis.spending} Spendings`,
                value: `**Fame:** **\`${user.spent?.fameCollected.toFixed(2)}\`**\n**Elixir:** **\`${user.spent?.elixirCollected.toFixed(2)}\`**`,
                inline: true
            }, {
                name: `${emojis.showcase} Showcase`,
                value: `**Missions Completed:** **\`${user.missions?.missionsCompleted}\`**
**Games Won:** **\`${user.games?.won} times\`**
**Missions:** **\`${user.missions?.missionsCompleted} times\`**
**Server Boosts:** **\`${user.nitro?.boosts} times\`**
**Nitro Earned:** **\`${user.nitro?.purchased} times\`**
**Ramen Voted:** **\`${user.ramen?.votes} times\`**`
            }
        ]
    });

    if (dpExists) {
        embed.thumbnail = {
            url: imageUrl
        }
    }
    
    if (!attachement) {
        await interaction.reply({
            embeds: [embed],
            ephemeral: show ? false : true
        });
    } else {
        await interaction.reply({
            embeds: [embed],
            files: [attachement],
            ephemeral: show ? false : true
        });
        if (locationImg) fs.rm(locationImg, (e) => e ? console.log(e) : null);
    }
}


async function imageOverlay(originalImage:string, imageOverlay:string, id:string) {
    originalImage = originalImage.replace('webp', 'jpg');
    let watermark = await Jimp.read(imageOverlay);
    watermark = watermark.resize(50,50); // Resizing watermark image
    let image = await Jimp.read(originalImage);
    image = image.resize(128, 128); // Resizing actual img to a std size
    image.composite(watermark, 85, 80, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacityDest: 1,
        opacitySource: 1
    });
    await image.writeAsync(`./assets/${id}.jpg`);
    return `./assets/${id}.jpg`;
}