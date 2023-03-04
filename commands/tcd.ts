import { CmdoArgs } from "../types";
import { daily, mission, coinflip, rps, sendCd } from '../data/timings.json';
import { correct, clock } from '../data/emojis.json';
import { MessageEmbed } from "discord.js";
import Users from "../schema/User";
import { timeRange } from "../helpers/toolbox";
import client from "../server";

export default async (args:CmdoArgs) => {
    const interaction = args.Interaction;

    const user = await Users.findOne({ id: interaction.user.id });
    if (!user) {
        await interaction.reply({
            content: 'You are not registered, use `/register`',
            ephemeral: true
        });
        return;
    }
    await interaction.deferReply();

    const now = Date.now();

    const dailyDb = user.reminder?.daily;
    const dailyDt = timeRange(dailyDb, now);
    const dText = dailyDb ? (dailyDt.seconds > daily) 
                            ? correct 
                            : `\`${Math.ceil(24 - dailyDt.hours)} hr\`` 
                        : correct;
    
    const missionDb = user.missions?.lastMission;
    const missionDt = timeRange(missionDb, now);
    const mText = missionDb ? (missionDt.seconds > mission) 
                                ? correct 
                                : `\`${Math.ceil(120 - missionDt.minutes)} min\`` 
                            : correct;

    const coinflipDb = user.games?.coinflip;
    const coinflipDt = timeRange(coinflipDb, now);
    const coinText = coinflip ? (coinflipDt.seconds > coinflip) 
                                ? correct 
                                : `\`${Math.ceil(15 - coinflipDt.minutes)} min\`` 
                            : correct;
    
    const rpsDb = user.games?.rps;
    const rpsDt = timeRange(rpsDb, now);
    const rpsText = rps ? (rpsDt.seconds > rps) 
                            ? correct 
                            : `\`${Math.ceil(5 - rpsDt.minutes)} min\`` 
                        : correct;

    const sendCdDb = user.sendCooldown;
    const sendCdDt = timeRange(sendCdDb, now);
    const sendText = sendCd ? (sendCdDt.seconds > sendCd) 
                                ? correct 
                                : `\`${Math.ceil(5 - sendCdDt.minutes)} min\`` 
                            : correct;

    const embed = new MessageEmbed({
        title: `${clock} Cooldowns`,
        fields: [
            {
                name: `MISSIONS`,
                value: `**Quiz:** ${mText}\n**Daily:** ${dText}`,
                inline: true
            },
            {
                name: `GAMES`,
                value: `**Coinflip:** ${coinText}\n**Rps:** ${rpsText}`,
                inline: true
            },
            {
                name: "OTHERS",
                value: `**/send**: ${sendText}`
            }
        ],
        footer: {
            iconURL: client.user?.displayAvatarURL(),
            text: "new minigame: ( /games rps )"
        }
    });

    await interaction.editReply({ embeds: [embed] });
}