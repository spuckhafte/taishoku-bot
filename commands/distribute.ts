import client from "../server";
import Users from "../schema/User";
import updateCurrency from '../helpers/assignCurrency'

import { CmdoArgs } from "../types";
import { TAISHOKU_SERVER_ID } from '../data/impVar.json'
import money from '../data/money.json';
import { getUsersByRole, isUserOrRole } from '../helpers/toolbox'
import { GuildMember, MessageEmbed } from "discord.js";
import emojis from '../data/emojis.json';

const schemaKeys:string[] = ["ramen", "events", "missions", "nitro", "roles", "invites"];

export default async (args:CmdoArgs) => {
    const interaction = args.Interaction;
    const subCmd = interaction.options.getSubcommand();
    const target = interaction.options.getMentionable('target', true).valueOf()
    const amount = interaction.options.getNumber('amount', true);
    let purpose = interaction.options.getString('purpose');

    const server = await client.guilds.fetch(TAISHOKU_SERVER_ID);
    const user = await Users.findOne({ id: interaction.user.id });

    if (!user || !client.user || !client.user.avatar) return;
    if (typeof target != 'string') return;
    if (subCmd !== 'fame' && subCmd !== 'elixir') return;
    if (!schemaKeys.includes(purpose ? purpose : '')) purpose = 'noroot';

    const userBal = subCmd == 'fame' ? user.totalFame : user.totalElixir;
    
    if ((subCmd == 'fame' && user.totalFame < money.fame.tax.taxFreeTransferThreshold) ||
        (subCmd == 'elixir' && user.totalElixir < money.elixir.tax.taxFreeTransferThreshold)
    ) {
        interaction.reply({
            content: `**For taxfree ${subCmd} transfer**\nMin Bal:  \`${money[subCmd].tax.taxFreeTransferThreshold} ${subCmd}\`\nYour Bal: \`${userBal} ${subCmd}\``,
            ephemeral: true
        })
        return;
    };

    if (amount <= 0) {
        interaction.reply({
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
        interaction.reply({
            content: "**No valid users of specific role/id found!**",
            ephemeral: true
        })
        return;
    }

    if (userBal < amount * membCount) {
        interaction.reply({
            content: `**You do not have enough \`${subCmd}\` to spend**`
        })
        return;
    }

    members.forEach(async member => {
        if (purpose != "ramen" && purpose != 'events' && purpose != "missions" && 
            purpose != "nitro" && purpose != "roles" && purpose !== 'noroot' && purpose != 'invites'
        ) return;

        await updateCurrency[subCmd](member.id, purpose, amount);
    });
    updateCurrency.spend[subCmd](interaction.user.id, amount * membCount);
    

    const embed = new MessageEmbed({
        title: `${emojis.money} ${subCmd.toUpperCase()} TRANSFER RECEIPT`,
        description: `**From: **<@${user.id}>\n**To: **<@${targetType == 'role' ? "&" : ""}${target}>\n**Sum Of: \`${amount*membCount} ${subCmd}\`**\n**Total Receivers: \`${membCount}\`**\n**Perhead: \`${amount} ${subCmd}\`**`,
        thumbnail: {
            url: client.user.displayAvatarURL()
        },
        footer: {
            text: `${interaction.createdAt.toString().replace(/\([A-Z a-z]+\)/g, '')}`
        }
    });
    if (interaction.user.avatarURL()) {
        embed.setFooter({
            text: `${interaction.createdAt.toString().replace(/\([A-Z a-z]+\)/g, '')}`,
            iconURL: interaction.user.displayAvatarURL()
        });
    };

    interaction.reply({ embeds: [embed] });
}