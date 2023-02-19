import assignCurrency from "../helpers/assignCurrency";
import { ModalArgs } from "../types";
import updateDb from "../helpers/updateDb";
import Users from "../schema/User";
import { Formatters, MessageEmbed } from "discord.js";
import client from "../server";
import { v4 } from "uuid";

import { shop } from "../data/shop.json";
import { money } from '../data/emojis.json';
import { storeLogsChannel, channelPermissions, customChannelCategory } from '../data/settings.json'


export default async (args:ModalArgs) => {
    const interaction = args.Interaction;
    if (!interaction.guild) return;
    await interaction.deferReply({ ephemeral: true });

    const member = (await interaction.guild?.members.fetch())
                        ?.find(user => user.id == interaction.user.id);
    const channelName = interaction.fields.getTextInputValue('channelName');
    const channelTopic = interaction.fields.getTextInputValue('channelTopic');
    const purchaseId = v4();

    if (!member) return;
    
    if (!channelName || !channelTopic) {
        interaction.editReply({
            content: "Invalid details, try again"
        });
        return;
    }

    const channel = await interaction.guild.channels.create(
        channelName,
        { parent: customChannelCategory }
    )
	channel.permissionOverwrites.edit(interaction.user, channelPermissions)
	channel.setTopic(channelTopic)


    const item = shop.find(item => item.name == 'Personal Channel')
    if (!item) return;
    await assignCurrency.spend.fame(interaction.user.id, item.price, purchaseId);

    const user = await Users.findOne({ id: interaction.user.id });
    if (!user) return;
    let prev = user.inventory?.goods?.[5]?.total
    await updateDb({ id: user.id }, 'inventory.goods.5.total', (prev ? prev : 0) + 1);

    const embed = new MessageEmbed({
        title: `${money} PURCHASE RECEIPT`,
        thumbnail: { url: client.user?.displayAvatarURL() },
        description: `**Customer:** <@${user.id}>\n**Amount:** \`${item.price}F\`\n**Item:** ${item.name}\n**Purchase Id:** \`${purchaseId}\``,
        footer: {
            text: `${interaction.createdAt.toString().replace(/\([A-Z a-z]+\)/g, '')}`,
            iconURL: interaction.user.displayAvatarURL()
        }
    });
    await interaction.editReply({ 
        embeds: [embed],
        content: `<@${user.id}>, here is your personal channel: ${Formatters.channelMention(channel.id)}`
    });

    const logChannel = client.channels.cache.find(ch => ch.id == storeLogsChannel);
    if (logChannel?.isText()) logChannel.send({ embeds: [embed] });
}