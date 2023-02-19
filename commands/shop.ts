import { CmdoArgs, Shop } from "../types";
import { MessageEmbed } from "discord.js";
import client from "../server";
import Users from "../schema/User";

import { shop } from "../data/shop.json"
import { shopping, lock } from '../data/emojis.json'
import shopActions from "../helpers/shopActions";


const NEVER_GONNA = 'https://www.youtube.com/watch?v=xvFZjo5PgG0';

export default async (args:CmdoArgs) => {
    const interaction = args.Interaction;
    const discordUser = interaction.user;
    const user = await Users.findOne({ id: discordUser.id });

    const subCmd = interaction.options.getSubcommand();
    const itemId = interaction.options.getNumber('item', false);

    if (subCmd == 'list') {
        const embed = new MessageEmbed({
            title: `${shopping} THE TAISHOKU STORE`,
            thumbnail: {
                url: client.user?.displayAvatarURL()
            },
            footer: {
                text: 'use ( /shop buy ) to get an item using its id',
                iconURL: discordUser.displayAvatarURL()
            }
        })

        for (let item of shop) {
            const field = generateField(item, user);
            if (!field) continue;
            embed.fields = [...embed.fields, field];
        }

        interaction.reply({ embeds: [embed] });
    }


    if (subCmd == 'buy') {
        const item = shop.find(shopItem => +shopItem.id == itemId);

        if (!item) {
            interaction.reply({
                content: "No item of this id exists in store",
                ephemeral: true
            })
            return;
        }

        shopActions(item, interaction);
    }
}


function generateField(shopItem:Shop, user:any) {
    const userServices = user.inventory.services
    const userGoods = user.inventory.goods
    const prestigeIds = [6, 7, 8, 9, 10];
    let prestige = 0; // tier of the prestige to be shown in the list

    if (prestigeIds.includes(+shopItem.id)) {
        for (let id of prestigeIds) {
            if (prestige != 0) break;
            if (userServices[id].bought == false) {
                prestige = id;
                break;
            }
        }
        prestige = prestige == 0 ? 11 : prestige;
    }

    if (prestige != 0 && +shopItem.id != prestige) return;
    const isMulti = shopItem.type == 'g' 
                        ? (typeof userGoods[shopItem.id].total == 'number' ? true : false)
                        : false;
    const bought = !isMulti ? shopItem.type == 'g' 
                                ? userGoods[shopItem.id].bought
                                : userServices[shopItem.id].bought
                            : false;
    const data = {
        name: `${shopItem.name} - ${shopItem.id}`,
        value: ` **[⏣ ${shopItem.price}](${NEVER_GONNA}) ${bought ? `${lock}` : ''}**\n${shopItem.desc}`,
        inline: false
    }
    return data;
}