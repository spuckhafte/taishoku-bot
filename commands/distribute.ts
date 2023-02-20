import { GuildMember, MessageEmbed } from "discord.js";
import client from "../server";
import updateCurrency from '../helpers/assignCurrency'
import { CmdoArgs } from "../types";

import { TAISHOKU_SERVER_ID } from '../data/impVar.json'
import { getUsersByRole, isUserOrRole } from '../helpers/toolbox'
import emojis from '../data/emojis.json';
import { distributeLogs, adminId } from '../data/settings.json';

const schemaKeys:string[] = ["ramen", "events", "missions", "nitro", "roles", "invites"];

export default async (args:CmdoArgs) => {
    const interaction = args.Interaction;
    const subCmd = interaction.options.getSubcommand();
    const target = interaction.options.getMentionable('target', true).valueOf()
    const amount = interaction.options.getNumber('amount', true);
    let purpose = interaction.options.getString('purpose');

    const server = await client.guilds.fetch(TAISHOKU_SERVER_ID);
    
    const allAdmins = await getUsersByRole(adminId);
    let adminIds = allAdmins.members.map(mem => mem.id);
    if (!adminIds.includes(interaction.user.id)) {
        await interaction.reply({
            content: "Only admins can access this command",
            ephemeral: true
        });
        return;
    }

    if (!client.user || !client.user.avatar) return;
    if (typeof target != 'string') return;
    if (subCmd !== 'fame' && subCmd !== 'elixir') return;
    if (!schemaKeys.includes(purpose ? purpose : '')) purpose = 'noroot';

    if (amount <= 0) {
        await interaction.reply({
            content: `**Invalid Amount**`,
            ephemeral: true
        });
        return;
    }

    let targetType = await isUserOrRole(target);
    
    let membCount:number;
    let members:GuildMember[];
    if (targetType == 'role') {
        let data = await getUsersByRole(target, [interaction.user.id], false);
        membCount = data.memberCount;
        members = data.members;
    } else {
        membCount = 1;
        members = [(await server.members.fetch(target))];
    };

    if (membCount == 0 || members[0].id == interaction.user.id) {
        await interaction.reply({
            content: "**No valid users of specific role/id found!**",
            ephemeral: true
        })
        return;
    }

    members.forEach(async member => {
        if (purpose != "ramen" && purpose != 'events' && purpose != "missions" && 
            purpose != "nitro" && purpose != "roles" && purpose !== 'noroot' && purpose != 'invites'
        ) return;

        await updateCurrency[subCmd](member.id, purpose, amount);
    });
    

    const embed = new MessageEmbed({
        title: `${emojis.money} ${subCmd.toUpperCase()} TRANSFER RECEIPT`,
        description: `**From: **<@${interaction.user.id}>\n**To: **<@${targetType == 'role' ? "&" : ""}${target}>\n**Sum Of: \`${amount*membCount} ${subCmd}\`**\n**Total Receivers: \`${membCount}\`**\n**Perhead: \`${amount} ${subCmd}\`**`,
        thumbnail: {
            url: client.user.displayAvatarURL()
        },
        footer: {
            text: `${interaction.createdAt.toString().replace(/\([A-Z a-z]+\)/g, '')}`,
            iconURL: interaction.user.displayAvatarURL()
        }
    });

    await interaction.reply({ embeds: [embed], ephemeral: true });
    const logChannel = client.channels.cache.find(ch => ch.id == distributeLogs);
    if (logChannel?.isText()) await logChannel.send({ embeds: [embed] });
}