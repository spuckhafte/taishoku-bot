import { CommandInteraction, Message, MessageActionRow, MessageEmbed, MessageSelectMenu, Modal, SelectMenuInteraction, TextInputComponent } from "discord.js";
import { Shop } from "../types";
import client from "../server";
import { v4 } from 'uuid';
import Users from "../schema/User";
import assignCurrency from "../helpers/assignCurrency";
import updateDb from "../helpers/updateDb";

import { storeLogsChannel, rogueId, purchasingRoleId } from '../data/settings.json'
import { money, showcase } from '../data/emojis.json';
import villages from '../data/villages.json';
import titles from '../data/titles.json';

export default async (item:Shop, interaction:CommandInteraction) => {
    if (!interaction.member) return;
    const user = (await Users.findOne({ id: interaction.user.id }));
    if (!user) return;

    const userFames = user.totalFame;

    if (userFames < item.price) {
        interaction.reply({
            content: "You can't afford it, use `/daily` or `/mission` to earn more",
            ephemeral: true
        });
        return;
    }

    const logChannel = client.channels.cache.find(ch => ch.id == storeLogsChannel);
    // const reqChannel = client.channels.cache.find(ch => ch.id == storeReqChannel);
    const member = (await interaction.guild?.members.fetch())
                                ?.find(user => user.id == interaction.user.id);
    const purchaseId = v4();

    // done: change village, rogue, title

    if (item.name == 'Title') {
        const userRoles = member?.roles.cache.map(role => role.id);
        let titleList = titles.filter(title => !userRoles?.includes(title.value));

        if (titleList.length == 1) {
            updateDb({ id: user.id }, 'inventory.goods.1.bought', true);
        }
        if (titleList.length == 0) {
            interaction.reply({
                content: "You already bought all the titles, awesome",
                ephemeral: true
            });
            return;
        }

        const row = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId('title')
					.setPlaceholder('If you loose this msg, contact admins')
                    // @ts-ignore
					.addOptions(titleList)
		    );
        const embed = generateReceipt(user, item, interaction, purchaseId);

        await assignCurrency.spend.fame(user.id, item.price);

        if (logChannel?.isText()) await logChannel.send({ embeds: [embed] });
        await interaction.reply({ 
            embeds: [embed], 
            components: [row],
            ephemeral: true
        });

    } else if (item.name == 'Change Village') {

        await member?.roles.add(purchasingRoleId);
        await assignCurrency.spend.fame(user.id, item.price);
        const list = member?.roles.cache.map(role => role.id);

        const villagesList = Object.keys(villages).map((vill, i) => {
            if (!list || !list.includes(Object.values(villages)[i])) {
                return {
                    label: vill,
                    description: `The ${vill} village`,
                    value: Object.values(villages)[i]
                }
            }
        }).filter(vill => vill != undefined);

        const row = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('changeVillage')
                .setPlaceholder('If you loose this msg, contact admins')
                // @ts-ignore
                .addOptions(villagesList)
        );

        const embed = generateReceipt(user, item, interaction, purchaseId);

        if (logChannel?.isText()) await logChannel.send({ embeds: [embed] });
        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });

    } else if (item.name == 'Rogue Ninja') {
        if (!user.inventory?.services) return;
        
        if (user.inventory?.services['4']?.bought) {
            await interaction.reply({
                content: "You are already a Rogue Ninja",
                ephemeral: true
            })
            return;
        }

        member?.roles.add(rogueId);
        const embed = generateReceipt(user, item, interaction, purchaseId);

        await assignCurrency.spend.fame(user.id, item.price);
        await updateDb({ id: user.id }, "inventory.services.4.bought", true);

        await interaction.reply({
            content: `**You are now a ROGUE NINJA ${showcase}**`,
            embeds: [embed],
            ephemeral: true
        });
        if (logChannel?.isText()) logChannel.send({ embeds: [embed] });
    } else if (item.name == 'Personal Role') {
        const modal = new Modal()
            .setCustomId("createPersonalRole")
            .setTitle("Personal Role");

        const row = new MessageActionRow<TextInputComponent>()
            .addComponents(
                new TextInputComponent()
                    .setCustomId('roleName')
                    .setLabel('A sweet name for your role')
                    .setStyle('SHORT')
            );
        
        modal.addComponents(row);
        await interaction.showModal(modal);
    }
}

function generateReceipt(user:any, item:Shop, interaction:CommandInteraction, purchaseId:string) {
    return new MessageEmbed({
        title: `${money} PURCHASE RECEIPT`,
        thumbnail: { url: client.user?.displayAvatarURL() },
        description: `**Customer:** <@${user.id}>\n**Amount:** \`${item.price}F\`\n**Item:** ${item.name}\n**Purchase Id:** \`${purchaseId}\``,
        footer: {
            text: `${interaction.createdAt.toString().replace(/\([A-Z a-z]+\)/g, '')}`,
            iconURL: interaction.user.displayAvatarURL()
        }
    });
}