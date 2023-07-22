import client from "../server.js";
import Users from "../schema/User.js";

import { CmdoArgs } from "../types";
import assignCurrency from "../helpers/assignCurrency.js";
import { MessageEmbed } from "discord.js";
import updateDb from "../helpers/updateDb.js";
import { timeRange } from "../helpers/toolbox.js";

import timings from '../data/timings.json'
import roleBenifits from '../data/fameForRoles.json'
import { rewards } from '../data/money.json'
import { earning, clock } from '../data/emojis.json'
import prestigeRoles from '../data/prestigeRoles.json'

const ELIXIR_ROLE = '1130679593112719442';

export default async (args: CmdoArgs) => {
    const interaction = args.Interaction;
    await interaction.deferReply({ ephemeral: true });

    const discordUser = interaction.user;
    const member = (await interaction.guild?.members.fetch())
        ?.find(mem => mem.id == discordUser.id);
    const user = await Users.findOne({ id: discordUser.id });

    const userRoles = member?.roles.cache.map(role => role.id);
    if (!userRoles) return;

    let benefitRole = 0;
    let benefitNitro = 0;
    let benefitPrestige = 0;
    let elixirs = 5;
    let nitroDone = false;
    let defaultDone = false;

    for (let roleId_i in Object.keys(roleBenifits)) { // doing it the "normal" way was messing it up, idk
        if (nitroDone && defaultDone) break;

        let impRoleId = Object.keys(roleBenifits)[+roleId_i];
        let roleBenefit = Object.values(roleBenifits)[+roleId_i];

        if (member?.roles.cache.find(r => r.id == impRoleId) && !defaultDone) {
            benefitRole += roleBenefit;
            defaultDone = true;
        }

        if (member?.roles.cache.find(r => r.id == rewards.booster.id) && !nitroDone) {
            benefitNitro += rewards.booster.fame;
            nitroDone = true;
        }
    }

    for (let pRole_i in Object.keys(prestigeRoles)) {
        if (+pRole_i == (Object.keys(prestigeRoles).length - 1)) break;

        let key = Object.keys(prestigeRoles)[pRole_i];
        // @ts-ignore (pRole_i is defentily a key of prestigeRoles object)
        let pRole: string = prestigeRoles[key];

        // @ts-ignore (pRole_i + 1 is defenitely a key of rewards.premium)
        let benefitPerTier = +rewards.premium[+pRole_i + 1];
        if (member?.roles.cache.find(r => r.id == pRole)) {
            benefitPrestige += benefitPerTier;
        } else break;
    }

    if (!user || !user.reminder || !member) {
        if (!user) {
            interaction.editReply({
                content: 'You are not registered, use `/register`'
            });
        }
        return;
    }

    const deltaTime = Date.now() - +user.reminder.daily;

    if (deltaTime > timings.daily * 1000) {
        await assignCurrency.fame(user.id, 'missions', rewards.daily);
        await assignCurrency.fame(user.id, 'roles', benefitRole);
        await assignCurrency.fame(user.id, 'nitro', benefitNitro);

        const eligibleForElixir = member.roles.cache.find(r => r.id == ELIXIR_ROLE);
        if (eligibleForElixir) {
            await assignCurrency.elixir(user.id, 'roles', elixirs);
        }

        const embed = new MessageEmbed({
            title: `${earning} DAILY REWARD`,
            description: `**Default Reward:** \`${rewards.daily}F\`\n**Role Benefit:** \`${benefitRole}F\`\n**Nitro Benefit:** \`${benefitNitro}F\`\n**Prestige Benefit:** \`${benefitPrestige}F\`\n==========\n**Elixir Benefit:** \`${eligibleForElixir ? elixirs : 0}E\``,
            thumbnail: {
                url: client.user?.displayAvatarURL()
            },
            footer: {
                text: `Come again tomorrow ${discordUser.username}`,
                iconURL: discordUser.displayAvatarURL()
            }
        });

        await interaction.editReply({
            embeds: [embed]
        });
        await updateDb({ id: user.id }, 'reminder.daily', Date.now());

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
        interaction.editReply({
            embeds: [embed]
        });
    }
}