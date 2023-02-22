import { CommandInteraction, Message, MessageActionRow, MessageEmbed, MessageSelectMenu, Modal, SelectMenuInteraction, TextInputComponent } from "discord.js";
import { Shop, Tiers } from "../types";
import client from "../server";
import { v4 } from 'uuid';
import Users from "../schema/User";
import assignCurrency from "./assignCurrency";
import updateDb from "./updateDb";
import { generateReceipt } from "./toolbox";

import { storeLogsChannel, rogueId } from '../data/settings.json'
import { showcase } from '../data/emojis.json';
import villages from '../data/villages.json';
import titles from '../data/titles.json';
import prestigeRoles from '../data/prestigeRoles.json';

export default async (item:Shop, interaction:CommandInteraction) => {
    if (!interaction.member) return;
    const user = (await Users.findOne({ id: interaction.user.id }));
    if (!user) {
        await interaction.reply({
            content: 'You are not registered, use `/register`',
            ephemeral: true
        });
        return;
    }

    const userFames = user.totalFame;

    if (userFames < item.price) {
        interaction.reply({
            content: "You can't afford it, use `/daily` or `/mission` to earn more",
            ephemeral: true
        });
        return;
    }

    const logChannel = client.channels.cache.find(ch => ch.id == storeLogsChannel);
    const member = (await interaction.guild?.members.fetch())
                                ?.find(user => user.id == interaction.user.id);
    const purchaseId = v4();

    // done: change village, rogue, title, personal role

    if (item.name == 'Title') {
        await interaction.deferReply({ ephemeral: true });
        const userRoles = member?.roles.cache.map(role => role.id);
        let titleList = titles.filter(title => !userRoles?.includes(title.value));

        if (titleList.length == 1) {
            await updateDb({ id: user.id }, 'inventory.goods.1.bought', true);
        }
        if (titleList.length == 0) {
            interaction.editReply({
                content: "You already bought all the titles, awesome"
            });
            return;
        }

        const row = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId('title')
					.setPlaceholder('If you loose this msg, contact admins')
					.addOptions(titleList)
		    );
        const embed = generateReceipt(user, item, interaction, purchaseId);

        await assignCurrency.spend.fame(user.id, item.price, purchaseId);

        if (logChannel?.isText()) await logChannel.send({ embeds: [embed] });
        await interaction.editReply({ 
            embeds: [embed], 
            components: [row]
        });

    } else if (item.name == 'Change Village') {
        await interaction.deferReply({ ephemeral: true });
        await assignCurrency.spend.fame(user.id, item.price, purchaseId);
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
        await interaction.editReply({
            embeds: [embed],
            components: [row]
        });

    } else if (item.name == 'Rogue Ninja') {
        await interaction.deferReply({ ephemeral: true })
        if (!user.inventory?.services) return;
        
        if (user.inventory?.services['4']?.bought) {
            await interaction.editReply({
                content: "You are already a Rogue Ninja"
            })
            return;
        }

        await member?.roles.add(rogueId);
        const embed = generateReceipt(user, item, interaction, purchaseId);

        await assignCurrency.spend.fame(user.id, item.price, purchaseId);
        await updateDb({ id: user.id }, "inventory.services.4.bought", true);

        await interaction.editReply({
            content: `**You are now a ROGUE NINJA ${showcase}**`,
            embeds: [embed]
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
        
        console.log('here in modal')
        modal.addComponents(row);
        await interaction.showModal(modal);
    } else if (item.name == 'Personal Channel') {
        const modal = new Modal()
            .setCustomId("createPersonalChannel")
            .setTitle("Personal Channel")

        const row1 = new MessageActionRow<TextInputComponent>()
            .addComponents(
                new TextInputComponent()
                    .setCustomId('channelName')
                    .setLabel('A sweet name for your channel')
                    .setStyle('SHORT')
            );
        const row2 = new MessageActionRow<TextInputComponent>()
            .addComponents(
                new TextInputComponent()
                    .setCustomId('channelTopic')
                    .setLabel('A breathtaking topic for your channel')
                    .setStyle('PARAGRAPH')
            );
        
        modal.addComponents(row1, row2);
        await interaction.showModal(modal);
    } else if (item.name.startsWith('Prestige')) {
        await interaction.deferReply({ ephemeral: true })
        const convert = { 'I': '1', 'II': '2', 'III': '3', 'IV': '4', 'V': '5' };
        const dbRef = { 1: 6, 2: 7, 3: 8, 4: 9, 5: 10 } // tier: item-id
        // @ts-ignore Prestige's suffix is definitely a key of convert
        const tier:Tiers = item.name.split('Prestige')[1].trim();
        const roleId = prestigeRoles[`Prestige ${tier}`];

        // @ts-ignore dbRef[convert[tier]] is defenetily an id
        await updateDb({ id: user.id }, `inventory.services.${dbRef[convert[tier]]}.bought`, true);
        await assignCurrency.spend.fame(user.id, item.price, purchaseId);
        await member?.roles.add(roleId);

        const embed = generateReceipt(user, item, interaction, purchaseId);

        await interaction.editReply({
            content: `You bought the **Tier ${tier} Prestige**, contact the admins for benefits ${showcase}`,
            embeds: [embed]
        });
        if (logChannel?.isText()) logChannel.send({ embeds: [embed] });
    }
}