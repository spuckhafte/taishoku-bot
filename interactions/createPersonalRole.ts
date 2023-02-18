import assignCurrency from "../helpers/assignCurrency";
import { ModalArgs } from "../types";
import updateDb from "../helpers/updateDb";
import Users from "../schema/User";
import { MessageEmbed } from "discord.js";
import client from "../server";
import { v4 } from "uuid";

import { shop } from "../data/shop.json";
import { money } from '../data/emojis.json';
import { storeLogsChannel } from '../data/settings.json'


export default async (args:ModalArgs) => {
    const interaction = args.Interaction;
    const member = (await interaction.guild?.members.fetch())
                        ?.find(user => user.id == interaction.user.id);
    const roleName = interaction.fields.getTextInputValue('roleName');
    if (!roleName) {
        interaction.reply({
            content: "Invalid name, try again",
            ephemeral: true
        });
        return;
    }
    const role = await interaction.guild?.roles.create({
        name: roleName,
        color: 'RANDOM'
    });
    if (!role) return;
    member?.roles.add(role.id);

    const item = shop.find(item => item.name == 'Personal Role')
    if (!item) return;
    await assignCurrency.spend.fame(interaction.user.id, item.price);

    const user = await Users.findOne({ id: interaction.user.id });
    if (!user) return;
    let prev = user.inventory?.goods?.[3]?.total
    await updateDb({ id: user.id }, 'inventory.goods.3.total', (prev ? prev : 0) + 1);

    const purchaseId = v4();
    const embed = new MessageEmbed({
        title: `${money} PURCHASE RECEIPT`,
        thumbnail: { url: client.user?.displayAvatarURL() },
        description: `**Customer:** <@${user.id}>\n**Amount:** \`${item.price}F\`\n**Item:** ${item.name}\n**Purchase Id:** \`${purchaseId}\``,
        footer: {
            text: `${interaction.createdAt.toString().replace(/\([A-Z a-z]+\)/g, '')}`,
            iconURL: interaction.user.displayAvatarURL()
        }
    });
    await interaction.reply({ 
        embeds: [embed],
        ephemeral: true
    });

    const logChannel = client.channels.cache.find(ch => ch.id == storeLogsChannel);
    if (logChannel?.isText()) logChannel.send({ embeds: [embed] });
}