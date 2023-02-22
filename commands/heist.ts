import { CommandInteraction, MessageActionRow, MessageButton, MessageComponentInteraction, MessageEmbed } from "discord.js";
import { CmdoArgs, StdObject } from "../types";
import { spending } from '../data/emojis.json';
import assignCurrency from "../helpers/assignCurrency";
import Users from "../schema/User";
import { register } from "../helpers/registerAll";
import updateDb from "../helpers/updateDb";
import { adminId, puffyId } from '../data/settings.json';
import client from "../server";

let membersIn:string[] = [];
let total = 0;

export default async (args:CmdoArgs) => {
    const interaction = args.Interaction;
    await interaction.deferReply();

    const pool = interaction.options.getNumber('pool', true);
    const time = interaction.options.getNumber('time', true);
    const max = interaction.options.getNumber('max', false);
    const filter = interaction.options.getRole('filter', false);

    const author = interaction.guild?.members.cache.find(mem => mem.id == interaction.user.id);
    if (!author?.roles.cache.find(rol => rol.id == adminId || rol.id == puffyId)) {
        await interaction.editReply('You don\'t have an authority to start a Heist');
        return;
    }

    const row = generateBtn();
    const embed = generateEmbed(pool, time, interaction, max, filter);

    const msg = await interaction.editReply({
        embeds: [embed],
        components: [row]
    });

    const collectorFilter = (btn:MessageComponentInteraction) => {
        return msg.id == btn.message.id
    }

    const collector = interaction.channel?.createMessageComponentCollector({
        filter: collectorFilter, 
        max: max ? max : 10000
    });

    collector?.on('collect', async btn => {
            await btn.deferUpdate();
            const user = btn.user;

            if (membersIn.includes(user.id)) return;

            const member = interaction.guild?.members.cache.find(mem => mem.id == user.id);
            if (!member) return;

            if (filter) {
                if (!member?.roles.cache.find(role => role.id == filter.id)) return;
            }

            const userDb = await Users.exists({ id: user.id });
            if (!userDb) await register(member);

            membersIn.push(user.id);
            total += 1;

            await interaction.editReply({
                embeds: [generateEmbed(pool, time, interaction, max, filter)],
                components: [generateBtn(max ? max == total : false)]
            });
    });

    setTimeout(async () => {
        await interaction.editReply({
            embeds: [generateEmbed(pool, time, interaction, max, filter)],
            components: [generateBtn(true)]
        });
        const equalDivision = pool / total;
    
        const validPairCount = range(total % 2 == 0 ? total / 2 : (total - 1) / 2, 1);
        const totalPairs = random<number>(validPairCount);

        const split:string[][] = [];
        for (let _ in range(totalPairs, 1)) {

            const randomUser1 = random<string>(membersIn);
            membersIn = membersIn.filter(id => id != randomUser1);

            const randomUser2 = random<string>(membersIn);
            membersIn = membersIn.filter(id => id != randomUser2);

            split.push([randomUser1, randomUser2]);
        }

        const money:StdObject = {};

        const unequalSplit = [120, 110, 100, 90, 80, 70, 60, 40, 30, 20, 10, 0]; // percent;

        for (let users of split) {
            let first = +((random<number>(unequalSplit)/100) * (2 * equalDivision)).toFixed(0);
            let second = +((2 * equalDivision) - first).toFixed(0);
            money[users[0]] = first;
            money[users[1]] = second;
        }

        for (let user of membersIn) {
            money[user] = equalDivision;
        }

        for (let id of Object.keys(money)) {
            const user = await Users.findOne({ id });
            if (!user) return;
            if (money[id] > 0) {
                await assignCurrency.fame(id, 'noroot', money[id]);
                await interaction.channel?.send(`<@${id}> got away with **${money[id]} Fame**`);

            } else if (money[id] == 0) {
                await interaction.channel?.send(`<@${id}> got nothing, sed`);
            } else {
                if (user.totalFame > 0) {
                    if (user.totalFame < Math.abs(money[id])) 
                        await updateDb({ id }, 'totalFame', 0);
                    else await assignCurrency.spend.fame(id, Math.abs(money[id]));
                }
                await interaction.channel?.send(`<@${id}> *got caught* and lost **${Math.abs(money[id])}**, lmao`);
            }
        }

        total = 0;
        membersIn = [];

        await interaction.channel?.send('**HEIST COMPLETE**');

    }, time * 60 * 1000);
}

function range(size:number, startAt = 0) {
    return [...Array(size).keys()].map(i => i + startAt);
}

function random<Type>(array: Type[]):Type {
    return array[Math.floor(Math.random() * array.length)];
}

function generateEmbed(pool:number, time:number, interaction:CommandInteraction, max:number|null, filter:any) {
    return new MessageEmbed({
        title: `${spending} HEIST`,
        description: `**Pool:** ${pool} Fame\n**Members In:** ${total}\n**Open For:** ${time} minutes${filter ? `\n**Filter:** <@&${filter.id}>` : ''}`,
        footer: {
            text: `Heist started by ${interaction.user.username} for ${max ? max : 'unlimited'} members`,
            iconURL: interaction.user.displayAvatarURL()
        },
        thumbnail: { url: client.user?.displayAvatarURL() }
    });
}

function generateBtn(disable=false) {
    return new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('getInHeist')
                .setLabel(disable ? 'Closed' : 'Get In')
                .setStyle('PRIMARY')
                .setDisabled(disable)
    );
}