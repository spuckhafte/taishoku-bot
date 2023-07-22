import { Formatters, MessageActionRow, MessageButton, MessageComponentInteraction, MessageEmbed } from "discord.js";
import Users from "../schema/User.js";
import client from "../server.js";
import { CmdoArgs, LbParams, StdObject } from "../types";
import { right, left, fastLeft, fastRight, showcase } from '../data/emojis.json'

export default async (args: CmdoArgs) => {
    const interaction = args.Interaction;
    await interaction.deferReply();

    const lbType = interaction.options.getSubcommand()

    // @ts-ignore (lbType is defenitely LbParams type)
    const { findQuery, where } = queryForSorting(lbType);
    if (!findQuery) return;

    const sortQueryObject: StdObject = {};
    sortQueryObject[findQuery[1]] = -1;

    const allUsers = await Users.find({}, findQuery).sort(sortQueryObject);
    const total = allUsers.length;
    const lastPage = Math.ceil(total / 10);
    const { embed, row } = await showPage(1, allUsers, total, interaction.user.id, where, lbType, interaction.user.displayAvatarURL());

    const msg = await interaction.editReply({ embeds: [embed], components: [row] });

    const filter = (btn: MessageComponentInteraction) => {
        return btn.user.id == interaction.user.id && msg.id == btn.message.id;
    }

    const collector = interaction.channel?.createMessageComponentCollector({
        filter, time: 10 * 60 * 1000
    });

    collector?.on('collect', async btn => {
        await btn.deferUpdate();
        let _page = btn.message.embeds[0].footer?.text.split('Page ')[1].split('of')[0].trim();
        if (!_page) return;

        let page = +_page;
        if (btn.customId == 'extremeLeft') {
            page = 1;
        }
        if (btn.customId == 'turnPageRight') {
            page += 1;
        }
        if (btn.customId == 'turnPageLeft') {
            page -= 1;
        }
        if (btn.customId == 'extremeRight') {
            page = lastPage
        }
        if (btn.customId == 'yourPage') {
            const userIndex = allUsers.findIndex(val => val.id == interaction.user.id);
            const userPage = Math.ceil((userIndex + 1) / 10);
            page = userPage;
        }

        const { embed, row } = await showPage(
            page, allUsers, lastPage, interaction.user.id, where, lbType, interaction.user.displayAvatarURL()
        );
        await interaction.editReply({
            embeds: [embed],
            components: [row]
        });
    });

    collector?.on('end', async btn => {
        let embed = btn.last()?.message.embeds[0];
        if (!embed) return;
        await interaction.editReply({ embeds: [embed], components: [] });
    })
}

function queryForSorting(type: LbParams) {
    if (type == 'fame' || type == 'elixir') {
        return {
            findQuery: ['id', `total${type.replace(type[0], type[0].toUpperCase())}`, 'username'],
            where: `total${type.replace(type[0], type[0].toUpperCase())}`
        }
    } else {
        if (type == 'games') return {
            findQuery: ['id', 'games.won', 'username'], where: 'won'
        }
        if (type == 'missions') return {
            findQuery: ['id', 'missions.missionsCompleted', 'username'], where: 'missionsCompleted'
        }
    }
}

async function showPage(pageNo: number, all: any, totalPage: number, id: string, where: string, type: string, avatar: string) {
    const from = (pageNo - 1) * 10;
    // @ts-ignore
    const userIndex = all.findIndex(val => val.id == id);
    const userExists = userIndex > -1 ? true : false;

    let desc = ``;
    let i = 0;
    for (let user_i = from; user_i < from + 10; user_i++) {
        const user = all[user_i];
        if (!user) break;
        desc += `\`#${((pageNo - 1) * 10) + i + 1}\` **${user.username}** [${user[where].toFixed(0)} ${type}](https://www.youtube.com/watch?v=xvFZjo5PgG0)\n`;
        i += 1;
    }
    const embed = new MessageEmbed({
        title: `${showcase} ${type} LB`.toUpperCase(),
        description: desc,
        thumbnail: { url: client.user?.displayAvatarURL() },
        footer: {
            text: `Page ${pageNo} of ${totalPage}`,
            iconURL: avatar
        }
    });

    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setEmoji(fastLeft)
                .setCustomId('extremeLeft')
                .setStyle('SECONDARY')
                .setDisabled(pageNo == 1)
        )
        .addComponents(
            new MessageButton()
                .setEmoji(left)
                .setCustomId('turnPageLeft')
                .setStyle('SUCCESS')
                .setDisabled(pageNo == 1)
        )
        .addComponents(
            new MessageButton()
                .setEmoji(right)
                .setCustomId('turnPageRight')
                .setStyle('SUCCESS')
                .setDisabled(pageNo == totalPage)
        )
        .addComponents(
            new MessageButton()
                .setEmoji(fastRight)
                .setCustomId('extremeRight')
                .setStyle('SECONDARY')
                .setDisabled(pageNo == totalPage)
        )

    if (userExists) {
        row.addComponents(
            new MessageButton()
                .setLabel('Your Page')
                .setCustomId(`yourPage`)
                .setStyle('PRIMARY')
                .setDisabled(pageNo == Math.ceil(userIndex / 10))
        );
    }

    return { embed, row };
}