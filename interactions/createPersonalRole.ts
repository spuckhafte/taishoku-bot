import assignCurrency from "../helpers/assignCurrency.js";
import { ModalArgs } from "../types";
import updateDb from "../helpers/updateDb.js";
import Users from "../schema/User.js";
import client from "../server.js";
import { v4 } from "uuid";
import { generateReceipt } from "../helpers/toolbox.js";

import { shop } from '../data/shop.json'
import { storeLogsChannel } from '../data/settings.json'

export default async (args: ModalArgs) => {
    const interaction = args.Interaction;
    const member = (await interaction.guild?.members.fetch())
        ?.find(user => user.id == interaction.user.id);
    const roleName = interaction.fields.getTextInputValue('roleName');
    const purchaseId = v4();

    interaction.deferReply({ ephemeral: true })

    if (!roleName) {
        await interaction.editReply({
            content: "Invalid name, try again"
        });
        return;
    }

    const role = await interaction.guild?.roles.create({
        name: roleName,
        color: 'RANDOM'
    });
    if (!role) return;
    await member?.roles.add(role.id);

    const item = shop.find(item => item.name == 'Personal Role')
    if (!item) return;
    await assignCurrency.spend.fame(interaction.user.id, item.price, purchaseId);

    const user = await Users.findOne({ id: interaction.user.id });
    if (!user) {
        await interaction.editReply({
            content: 'You are not registered, use `/register`'
        });
        return;
    }
    let prev = user.inventory?.goods?.[3]?.total
    await updateDb({ id: user.id }, 'inventory.goods.3.total', (prev ? prev : 0) + 1);

    const embed = generateReceipt(user, item, interaction, purchaseId);
    await interaction.editReply({
        embeds: [embed]
    });

    const logChannel = client.channels.cache.find(ch => ch.id == storeLogsChannel);
    if (logChannel?.isText()) logChannel.send({ embeds: [embed] });
}