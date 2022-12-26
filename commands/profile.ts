import { MessageAttachment, MessageEmbed } from "discord.js";
import Users from "../schema/User";
import client from "../server";
import { CmdoArgs } from "../types";
import emojis from '../data/emojis.json';
import { TAISHOKU_SERVER_ID } from '../data/impVar.json'
import { timeRange } from "../helpers/toolbox";
import Jimp from "jimp";
import fs from 'fs';

export default async (args:CmdoArgs) => {
    const interaction = args.Interaction;
    const show = interaction.options.getBoolean("show");
    const user = await Users.findOne({ id: interaction.user.id });
    if (!user) return;
    const member = await (await client.guilds.fetch(TAISHOKU_SERVER_ID)).members.fetch(user.id);

    let imageUrl:string;
    let nitroRole = member.roles.cache.toJSON().find(role => role.name == 'Server Booster');
    let attachement;
    let locationImg;
    if (nitroRole) {
        imageUrl = await imageOverlay(member.displayAvatarURL(), './assets/nitro.png', member.id);
        attachement = new MessageAttachment(imageUrl, 'favicon.png');
        locationImg = imageUrl
        imageUrl = "attachment://favicon.png";
    }
    else imageUrl = member.displayAvatarURL();

    const embed = new MessageEmbed({
        title: `${emojis.profile} ${member?.user.username}`,
        description: `**Username:** ${member?.user.username},
**Nickname:** ${member.nickname}
**Since:** ${(new Date(user.started ?? "")).toString().replace(/GMT\+[0-9]+ \([A-Z a-z]+\)/g, '')}
**Level:** <@&${user.roles?.currentHighestRole}>`,
        thumbnail: {
            url: imageUrl
        },
        fields: [
            {
                name: `${emojis.earning} Balance`,
                value: `**Fame:** **\`${user.totalFame}\`**
**Elixir:** **\`${user.totalElixir}\`**`,
                inline: false,
            }, {
                name: `${emojis.money} Earnings`,
                value: `**Missions:** **\`${user.missions?.fameCollected}F\`  \`${user.missions?.elixirCollected}E\`**
**Roles:** **\`${user.roles?.fameCollected}F\`  \`${user.roles?.elixirCollected}E\`**
**Events:** **\`${user.events?.fameCollected}F\`  \`${user.events?.elixirCollected}E\`**
**Nitro:** **\`${user.nitro?.fameCollected}F\`  \`${user.nitro?.elixirCollected}E\`**
**Ramen:** **\`${user.ramen?.fameCollected}F\`  \`${user.ramen?.elixirCollected}E\`**
**NoRoot:** **\`${user.noroot?.fameCollected}F\`  \`${user.noroot?.elixirCollected}E\`**`,
                inline: true
            }, {
                name: `${emojis.spending} Spendings`,
                value: `**Fame:** **\`${user.spent?.fameCollected}\`**\n**Elixir:** **\`${user.spent?.elixirCollected}\`**`,
                inline: true
            }, {
                name: `${emojis.showcase} Showcase`,
                value: `**Missions Completed:** **\`${user.missions?.missionsCompleted}\`**
**Highest Role:** <@&${user.roles?.highestRole?.id}> ${timeRange(user.roles?.highestWhen).dayLiteral} ${user.roles?.highestRole?.id == user.roles?.currentHighestRole ? '*and counting...' : ''}*
**Server Boosts:** **\`${user.nitro?.boosts} times\`**
**Nitro Earned:** **\`${user.nitro?.purchased} times\`**
**Ramen Voted:** **\`${user.ramen?.votes} times\`**`
            }
        ]
    });
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
    const image = await Jimp.read(originalImage);
    image.composite(watermark, 85, 80, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacityDest: 1,
        opacitySource: 1
    })
    await image.writeAsync(`./assets/${id}.jpg`);
    return `./assets/${id}.jpg`;
}