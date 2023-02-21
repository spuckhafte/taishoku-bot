import { 
    CommandInteraction, 
    MessageActionRow, 
    MessageAttachment, 
    MessageButton,
    MessageComponentInteraction, 
    MessageEmbed
} 
from "discord.js";
import Users from "../../schema/User";

import { game } from '../../data/emojis.json';
import { rewards } from '../../data/money.json';
import { registerGamesIfNot, timeRange } from '../toolbox'
import timeGap from '../../data/timings.json';
import updateDb from "../updateDb";
import assignCurrency from "../assignCurrency";

const index = {
    'dollar': '1',
    'euro': '2'
}

export default async (fame:number, interaction:CommandInteraction) => {
    let user = await Users.findOne({ id: interaction.user.id });
    if (!user) {
        interaction.reply({
            content: 'You are not registered, use `/register/`',
            ephemeral: true
        });
        return;
    }

    if (!user.games || !user.games?.coinflip) {
        if (!user.games) {
            const newUser = await registerGamesIfNot(user.id);
            if (!newUser) return;
            user = newUser;
        }
        
        if (!user.games?.coinflip) {
            // @ts-ignore
            user.games.coinflip = '0';
            let data = await user.save();
            if (!data) return;
            user = data;
        }
    }

    let last = user.games?.coinflip;
    if (!last) last = '0';

    if (timeGap.coinflip * 1000 > (+Date.now() - +last)) {
        await interaction.reply({
            content: `Wait for \`${(15 - timeRange(`${last}`, Date.now()).minutes).toFixed(2)}\` minutes`,
            ephemeral: true
        });
        return;
    }

    if (user.totalFame < fame) {
        await interaction.reply({
            content: `You can't bet on that, check your balance`,
            ephemeral: true
        });
        return;
    }

    if (fame <= 0) {
        await interaction.reply({
            content: `Invalid Amount`,
            ephemeral: true
        });
        return;
    }

    if (!interaction.channel) return;

    const btns = new MessageActionRow()
		.addComponents(
			new MessageButton()
                .setCustomId('dollar')
                .setLabel('Dollar')
                .setStyle('PRIMARY'),
		)
		.addComponents(
			new MessageButton()
                .setCustomId('euro')
                .setLabel('Euro')
                .setStyle('PRIMARY'),
		);

    const msg = await interaction.reply({
        components: [btns],
        fetchReply: true
    });

    const filter = (btn:MessageComponentInteraction) => {
        return btn.user.id == interaction.user.id && msg.id == btn.message.id;
    }

    const collector = interaction.channel.createMessageComponentCollector({
        filter, max: 1
    });

    collector.on('collect', async btn => {
        btn.deferUpdate();
        const choice = btn.customId;
        const coinToss = ['dollar', 'euro'][Math.floor(Math.random() * ['dollar', 'euro'].length)];
        if (coinToss != 'dollar' && coinToss != 'euro') return;

        const win = choice == coinToss ? true : false;
        const loop = index[coinToss];
        const bet = +((rewards.coinFlip / 100) * fame).toFixed(2);

        await updateDb({ id: interaction.user.id }, 'games.coinflip', Date.now());
        if (win) await assignCurrency.fame(interaction.user.id, 'games', bet);
        else await assignCurrency.spend.fame(interaction.user.id, fame);

        if (loop != '1' && loop != '2') return;

        await animation(loop, interaction, win, choice, coinToss, win ? bet : fame);
    })
}

async function animation(loop:'1'|'2', inter:CommandInteraction, win:boolean, choice:string, coin:string, bet:number) {
    const phase = ['a', 'b', 'c', 'd', 'e', 'f'];
    for (let i of phase) {
        let url = i == 'f' ? `loop${loop}` : `loop-${i}`;
        const { embed, coinImg } = generateEmbed(url, choice);
        if (i == 'f') {
            embed.description = `Your choice: **${choice.toUpperCase()}**\nCoin flipped to: **${coin.toUpperCase()}**\n\n${win ? '**You Win**' : '**You Loose**'}`,
            embed.footer = {
                text: `${win ? '+' : '-'}${bet} Fame`,
                iconURL: inter.user.displayAvatarURL()
            }
            await inter.editReply({ embeds: [embed], files: [coinImg], components: [] });
        }
        else await inter.editReply({ embeds: [embed], files: [coinImg], components: [] });

        await sleep(500);
    }
} 

function generateEmbed(imageUrl:string, choice:string) {
    const embed = new MessageEmbed({
        title: `${game} Coinflip`,
        description: `Your choice: **${choice.toUpperCase()}**\n*The coin is flipping*`
    })
    const coinImg = new MessageAttachment(`assets/coinflip/${imageUrl}.png`, 'favicon.png');

    embed.thumbnail = { url: 'attachment://favicon.png' };


    return { embed, coinImg }
}

async function sleep(ms:number) {
    await new Promise(resolve => setTimeout(resolve, ms));
}