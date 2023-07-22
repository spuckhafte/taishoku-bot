import { CmdoArgs } from "../types";
import client from "../server.js";
import { getUsersByRole } from "../helpers/toolbox.js";
import updateCurrency from '../helpers/assignCurrency.js';

import { adminId, puffyId } from '../data/settings.json'
import emojis from '../data/emojis.json'
import { MessageEmbed } from "discord.js";

export default async (args: CmdoArgs) => {
    const interaction = args.Interaction;
    const subCmd = interaction.options.getSubcommand();
    const target = interaction.options.getUser('user', true);
    const amount = interaction.options.getNumber('amount', true);

    const allAdmins = await getUsersByRole(adminId);
    let adminIds = allAdmins.members.map(mem => mem.id);
    if (!adminIds.includes(interaction.user.id) && interaction.user.id != puffyId) {
        await interaction.editReply({
            content: "Only admins can access this command"
        });
        return;
    }

    if (!client.user || !client.user.avatar) return;
    if (subCmd !== 'fame' && subCmd !== 'elixir') return;

    if (amount <= 0) {
        await interaction.editReply({
            content: `**Invalid Amount**`
        });
        return;
    }

    const embed = new MessageEmbed({
        title: `${emojis.money} ${subCmd.toUpperCase()} TRANSFER RECEIPT (WITHDRAWL)`,
        description: `**From: **<@${target.id}>\n**To: **<@${puffyId}>\n**Sum Of: \`${amount} ${subCmd}\`**`,
        thumbnail: {
            url: client.user.displayAvatarURL()
        },
        footer: {
            text: `${interaction.createdAt.toString().replace(/\([A-Z a-z]+\)/g, '')}`,
            iconURL: interaction.user.displayAvatarURL()
        }
    });

    await updateCurrency[subCmd](target.id, 'noroot', (0 - amount));
    await updateCurrency[subCmd](puffyId, 'noroot', amount);

    await interaction.reply({
        embeds: [embed],
        ephemeral: true,
    });
}