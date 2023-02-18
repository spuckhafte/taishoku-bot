import client from "../server";
import Users from "../schema/User";

import { CmdoArgs } from "../types";
import assignCurrency from "../helpers/assignCurrency";
import { MessageEmbed } from "discord.js";
import updateDb from "../helpers/updateDb";
import { timeRange } from "../helpers/toolbox";

import timings from '../data/timings.json';
import roleBenifits from '../data/fameForRoles.json';
import { rewards } from '../data/money.json';
import { earning, clock } from '../data/emojis.json'
import settings from '../data/settings.json';


export default async (args:CmdoArgs) => {
    const interaction = args.Interaction;
    const discordUser = interaction.user;
    const member = (await interaction.guild?.members.fetch())
                        ?.find(mem => mem.id == discordUser.id);
    const user = await Users.findOne({ id: discordUser.id });

    const userRoles = member?.roles.cache.map(role => role.id);
    let benefit = 0;
    let nitroDone = false;
    let defaultDone = false

    for (let roleId_i in Object.keys(roleBenifits)) { // doing it the "normal" way was messing it up, idk
        if (!userRoles) break;
        if (nitroDone && defaultDone) break;

        let impRoleId = Object.keys(roleBenifits)[+roleId_i];
        let roleBenefit = Object.values(roleBenifits)[+roleId_i];

        if (userRoles.includes(impRoleId) && !defaultDone) {
            benefit += roleBenefit;
            defaultDone = true;
        }

        if (userRoles.includes(rewards.booster.id) && !nitroDone) {
            benefit += rewards.booster.fame;
            nitroDone = true;
        }
    }

    if (!user || !user.reminder || !member) {
        if (!user) {
            interaction.reply({
                content: 'You\'ll be registered soon (10 seconds or so)',
                ephemeral: true
            });
        }
        return;
    }

    const deltaTime = Date.now() - +user.reminder.daily*1000

    if (deltaTime > timings.daily * 1000) {
        await assignCurrency.fame(user.id, 'missions', rewards.daily);
        assignCurrency.fame(user.id, 'roles', benefit);

        const embed = new MessageEmbed({
            title: `${earning} DAILY REWARD`,
            description: `**Default:** \`${rewards.daily}F\`\n**Benifit:** \`${benefit}F\``,
            thumbnail: {
                url: client.user?.displayAvatarURL()
            },
            footer: {
                text: `Come again tomorrow ${discordUser.username}`,
                iconURL: discordUser.displayAvatarURL()
            }
        });

        await interaction.reply({
            embeds: [embed],
            ephemeral: settings.dailyPvt
        });
        updateDb({ id: user.id }, 'reminder.daily', Date.now());

    } else {
        const still = (24 - timeRange(user.reminder.daily, Date.now()).hours).toFixed(2);
        const embed = new MessageEmbed({
            title: `${clock} DAILY`,
            description: `\`${still}hrs\` are still left`,
            footer: {
                iconURL: discordUser.displayAvatarURL(),
                text: 'Try again later'
            }
        });
        interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
    }
}