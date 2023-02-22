import { GuildMember, MessageEmbed } from "discord.js";
import client from "../server";
import updateCurrency from '../helpers/assignCurrency'
import { CmdoArgs } from "../types";

import { TAISHOKU_SERVER_ID } from '../data/impVar.json'
import { getUsersByRole, isUserOrRole } from '../helpers/toolbox'
import emojis from '../data/emojis.json';
import { distributeLogs, adminId, puffyId } from '../data/settings.json';
import Users from "../schema/User";

const schemaKeys:string[] = ["ramen", "events", "missions", "nitro", "roles", "invites"];

export default async (args:CmdoArgs) => {
    const interaction = args.Interaction;
    const subCmd = interaction.options.getSubcommand();
    const target = interaction.options.getMentionable('target', true).valueOf()
    const amount = interaction.options.getNumber('amount', true);
    let purpose = interaction.options.getString('purpose');

    const server = await client.guilds.fetch(TAISHOKU_SERVER_ID);

    await interaction.deferReply()
    
    const allAdmins = await getUsersByRole(adminId);
    let adminIds = allAdmins.members.map(mem => mem.id);
    if (!adminIds.includes(interaction.user.id) && interaction.user.id != puffyId) {
        await interaction.editReply({
            content: "Only admins can access this command"
        });
        return;
    }

    if (!client.user || !client.user.avatar) return;
    if (typeof target != 'string') return;
    if (subCmd !== 'fame' && subCmd !== 'elixir') return;
    if (!schemaKeys.includes(purpose ? purpose : '')) purpose = 'noroot';

    if (amount <= 0) {
        await interaction.editReply({
            content: `**Invalid Amount**`
        });
        return;
    }

    let targetType = await isUserOrRole(target);
    
    let membCount:number;
    let members:GuildMember[];
    if (targetType == 'role') {
        let data = await getUsersByRole(target, [interaction.user.id]);
        membCount = data.memberCount;
        members = data.members;
    } else {
        membCount = 1;
        members = [(await server.members.fetch(target))];
    };

    if (membCount == 0 || members[0].id == interaction.user.id) {
        await interaction.editReply({
            content: "**No valid users of specific role/id found!**"
        })
        return;
    }

    members.forEach(async member => {
        if (purpose != "ramen" && purpose != 'events' && purpose != "missions" && 
            purpose != "nitro" && purpose != "roles" && purpose !== 'noroot' && purpose != 'invites'
        ) return;

        if (!(await Users.findOne({ id: member.id }))) return;

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

    await interaction.editReply({ embeds: [embed] });
    const logChannel = client.channels.cache.find(ch => ch.id == distributeLogs);
    if (logChannel?.isText()) await logChannel.send({ embeds: [embed] });
}