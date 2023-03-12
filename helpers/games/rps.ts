import { CommandInteraction, Message, MessageActionRow, MessageAttachment, MessageButton, MessageComponentInteraction, MessageEmbed, User } from 'discord.js'
import Jimp from 'jimp';
import { game, rock, paper, scissors, party, clock, earning, money, hammer } from '../../data/emojis.json';
import Users from '../../schema/User';
import client from '../../server';
import { GameResponse, StdObject } from '../../types';
import assignCurrency from '../assignCurrency';
import { registerGamesIfNot, timeRange } from '../toolbox';
import updateDb from '../updateDb';
import fs from 'fs/promises';
import timeGap from '../../data/timings.json';

const waitingTime = 300; // seconds
const responseTime = 10; // --

const ephemeralCond = (user:User, author:User, bet:number) => (user.bot || user.id == author.id || bet <= 0 || bet > 500);

const Games:GameResponse = {}; // { msgId: { user_1_id: r, user_2_id: p } }

export default async (fame:number, against:User, interaction:CommandInteraction) => {
    const msg = await interaction.deferReply({ 
            fetchReply: true, ephemeral: ephemeralCond(against, interaction.user, fame)
    });
    
    fame = +fame.toFixed(2);

    if (fame <= 0) {
        await interaction.editReply('Invalid bet amount');
        return;
    }

    if (fame > 500) {
        await interaction.editReply('You can atmost bet for `500` Fame');
        return;
    }

    let user = await Users.findOne({ id: interaction.user.id });
    if (!user) {
        await interaction.editReply({
            content: 'You are not registered, use `/register`'
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

    if (user.totalFame < fame) {
        await interaction.editReply('Check your balance, you can\'t bet on that');
        return;
    }

    let last = user?.games?.rps;
    if (!last) last = '0';

    if (timeGap.rps * 1000 > (+Date.now() - +last)) {
        await interaction.editReply({
            content: `Wait for \`${(10 - timeRange(`${last}`, Date.now()).minutes).toFixed(2)}\` minutes`
        });
        return;
    }

    let bet = fame * 2;
    let rival = await Users.findOne({ id: against.id });
    if (!rival) {
        await interaction.editReply('Rival is not registered, ask him to use \`/register\`')
        return;
    }
    if (!rival.games || !rival.games?.coinflip) {
        if (!rival.games) {
            const newrival = await registerGamesIfNot(rival.id);
            if (!newrival) return;
            rival = newrival;
        }
        
        if (!rival.games?.coinflip) {
            // @ts-ignore
            rival.games.coinflip = '0';
            let data = await rival.save();
            if (!data) return;
            rival = data;
        }
    }

    if (against.bot || against.id == interaction.user.id) {
        await interaction.editReply('Invalid rival');
        return;
    }

    if (rival.totalFame < fame) {
        await interaction.editReply("Your rival can't bet on that");
        return;
    }

    const embed = new MessageEmbed({
        title: `${game} Rock Paper Scissor`,
        description: `**Waiting for *<@${against.id}>* to join**\n**Bet: \`${fame} fame\`**`,
        footer: {
            text: `Game will expire in ${waitingTime/60} minutes`
        }
    });
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('join-rps')
                .setLabel('Join')
                .setStyle('SUCCESS')
        );
    
    await interaction.editReply({ embeds: [embed], components: [row] });


    const filter = (btn:MessageComponentInteraction) => {
        return (btn.user.id == against.id || btn.user.id == interaction.user.id)
                && msg.id == btn.message.id;
    }

    const rivalCollector = interaction.channel?.createMessageComponentCollector({
        filter, time: waitingTime * 1000
    });

    rivalCollector?.on('collect', async btn => {
        await btn.deferUpdate();
        if (btn.customId !== 'join-rps') return;
        if (btn.user.id !== against.id) return;
        await sendController(bet, interaction, against);
        rivalCollector.stop();

        const responseCollector = interaction.channel?.createMessageComponentCollector({
            filter, time: responseTime * 1000
        });

        let done = false;
        responseCollector?.on('collect', async btn => {
            if (!btn.customId.startsWith('rps')) return;
            if (!Games[msg.id]) Games[msg.id] = {};

            if (!Games[msg.id][btn.user.id])
                Games[msg.id][btn.user.id] = btn.customId.split('-')[1];
                
            if (Object.keys(Games[msg.id]).length !== 2) return;
            done = true;

            const winIndex = winner(Object.values(Games[msg.id]));
            
            const emojiMap = { 'r': rock, 'p': paper, 's': scissors };

            // @ts-ignore (resp is definitely 'r' or 'p' or 's')
            const emojiResponse = Object.values(Games[msg.id]).map(resp => emojiMap[resp]);
            await sendController(bet, interaction, against, emojiResponse, Object.keys(Games[msg.id]), winIndex);

            if (winIndex == -1) return;

            const winId = Object.keys(Games[msg.id])[winIndex];
            await assignCurrency.fame(winId, 'games', (bet * 0.7));
            await assignCurrency.spend.fame(Object.keys(Games[msg.id])[winIndex == 0 ? 1 : 0], fame);

            await updateDb({ id: interaction.user.id }, 'games.rps', Date.now());
            await updateDb({ id: winId }, 'games.won', (prev:any) => prev.games.won + 1);
        })
        responseCollector?.on('end', async () => { 
            delete Games[msg.id];

            if (done) return;

            await interaction.editReply({ 
                content: `${clock} Game Timedout`,
                embeds: [],
                components: []
            });
        });

    });

    rivalCollector?.on('end', async coll => {
        if (coll.toJSON().find(btn => btn.user.id == against.id)) return;
        await interaction.editReply({
            content: `${clock} Waiting Timedout`,
            embeds: [],
            components: []
        });
    })
}


async function sendController(
    bet:number, interaction:CommandInteraction, against:User, res:string[]=[], users:string[]=[], won=-2
) {

    const embed = new MessageEmbed({
        title: `${game} Rock Paper Scissors`,
        description: `**Pool: \`${bet} Fame\`**\n\n**${interaction.user.username}:** *...choosing*\n**${against.username}:** *...choosing*`,
        thumbnail: { url: client.user?.displayAvatarURL() },
        footer: {
            text: `Choose in next ${responseTime} seconds`
        }
    });
    let row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('rps-r')
                .setEmoji(rock)
                .setStyle('PRIMARY')
        )
        .addComponents(
            new MessageButton()
                .setCustomId('rps-p')
                .setEmoji(paper)
                .setStyle('PRIMARY')
        )
        .addComponents(
            new MessageButton()
                .setCustomId('rps-s')
                .setEmoji(scissors)
                .setStyle('PRIMARY')
        );

    let attachment;
    let picUrl;

    if (won >= 0) {
        const winnImg = interaction.user.id == users[won] 
                        ? interaction.user.displayAvatarURL()
                        : against.displayAvatarURL();
        const looseImg = interaction.user.id != users[won]
                        ? interaction.user.displayAvatarURL()
                        : against.displayAvatarURL();
        
        picUrl = await shameImage(winnImg, looseImg, interaction.id);
        attachment = new MessageAttachment(picUrl, `favicon.png`);

        embed.thumbnail = { url: "attachment://favicon.png" }
    }

    if (won !== -2) {
        const firstIndex = users.indexOf(interaction.user.id);
        const secondIndex = firstIndex == 0 ? 1 : 0
        const looseIndex = won > -1 ? (won == 0 ? 1 : 0) : -1; 

        embed.description = `**Pool: \`${bet} Fame\`**\n`
                            + `\n**${interaction.user.username}:** ${res[firstIndex]}\n**${against.username}:** ${res[secondIndex]}\n\n`
                            + `${won > -1 ? `<@${users[won]}> **Won ${party}**` : 'Its a **Tie**'}`
                            + (won > -1 ? `\n\n${earning} <@${users[won]}> won **${bet*0.7} Fame**\n${money} <@${users[looseIndex]}> lost **${bet/2} Fame**` 
                              : '');

        embed.footer = { text: `${res[firstIndex]} vs ${res[secondIndex]}` };
    }

    await interaction.editReply({ 
        embeds: [embed], 
        components: won==-2 ? [row] : [],
        files: attachment ? [attachment] : []
    });
    if (picUrl) await fs.rm(picUrl);
}

function winner(res:string[]) {
    if (res[0] == 'r') {
        if (res[1] == 'p') return 1;
        else if (res[1] == 's') return 0;
        else return -1;
    } 
    else if (res[0] == 'p') {
        if (res[1] == 'r') return 0;
        else if (res[1] == 's') return 1;
        else return -1;
    } 
    else { // res[0] == 's'
        if (res[1] == 'r') return 1;
        else if (res[1] == 'p') return 0;
        else return -1;
    }
}

async function shameImage(_winner:string, _looser:string, id:string) {
    let parent = await Jimp.read('./assets/shame.jpg');
    parent = parent.resize(128, 128);

    let winner = await Jimp.read(_winner.replace('webp', 'jpg'));
    winner = winner.resize(30, 30);

    let looser = await Jimp.read(_looser.replace('webp', 'jpg'));
    looser = looser.resize(30, 30).rotate(-80);

    parent.composite(winner, 10, 2, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacityDest: 1,
        opacitySource: 1
    });
    parent.composite(looser, 95, 65, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacityDest: 1,
        opacitySource: 1
    });
    await parent.writeAsync(`./assets/${id}.jpg`);
    return `./assets/${id}.jpg`;
}