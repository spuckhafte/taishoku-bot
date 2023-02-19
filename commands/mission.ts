import { CmdoArgs } from "../types";
import missions from '../data/missions.json';
import { showcase, one, two, three, correct, wrong, clock } from '../data/emojis.json';
import { missionTiming } from '../data/settings.json';
import { rewards } from '../data/money.json';
import timeGap from '../data/timings.json';
import { MessageActionRow, MessageButton, MessageComponentInteraction, MessageEmbed } from "discord.js";
import client from "../server";
import assignCurrency from "../helpers/assignCurrency";
import updateDb from "../helpers/updateDb";
import Users from "../schema/User";
import { timeRange } from "../helpers/toolbox";

const emojiOpts = { 1: one, 2: two, 3: three };

export default async (args:CmdoArgs) => {
    const interaction = args.Interaction;
    const mission = missions[Math.floor(Math.random() * missions.length)];

    const user = await Users.findOne({ id: interaction.user.id });
    if (!user) return;
    
    let last = user.missions?.lastMission ? user.missions?.lastMission : 0;

    if (timeGap.mission * 1000 > (+Date.now() - +last)) {
        interaction.reply({
            content: `Wait for \`${(120 - timeRange(`${last}`, Date.now()).minutes).toFixed(2)}\` minutes`,
            ephemeral: true
        });
        return;
    }

    await updateDb({ id: user.id }, 'missions.lastMission', Date.now());

    const embed = new MessageEmbed({
        title: `${showcase} Mission`,
        description: `**${mission.question}**\n${optionsText(mission.options)}`,
        footer: {
            text: `You have ${missionTiming} seconds`,
            iconURL: interaction.user.displayAvatarURL()
        },
        thumbnail: { url: client.user?.displayAvatarURL() }
    });

    const row = generateOptionButtons(mission);

    const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });
    
    const filter = (btn:MessageComponentInteraction) => {
        return btn.user.id == interaction.user.id && msg.id == btn.message.id;
    }

    const timeout = setTimeout(() => {
        // @ts-ignore
        embed.footer.text = `${clock} Times up`;
        const rowNew = generateOptionButtons(mission, true, false, true);
        interaction.editReply({
            embeds: [embed],
            components: [rowNew]
        });
    }, missionTiming * 1000)

    const collector = interaction.channel?.createMessageComponentCollector({ 
        filter, time: missionTiming * 1000, max: 1
    });


    collector?.on('collect', async collected => {
        collected.deferUpdate();
        clearTimeout(timeout);

        const correct = collected.customId.includes('correct');
        if (correct) {
            await assignCurrency.fame(interaction.user.id, 'missions', rewards.mission);
            // @ts-ignore
            embed.footer?.text = `Correct, +${rewards.mission} Fames`
            let prevMissions = user.missions?.missionsCompleted ? user.missions.missionsCompleted : 0;
            await updateDb({ id: user.id }, 'missions.missionsCompleted', prevMissions + 1);
        } else {
            // @ts-ignore
            embed.footer?.text = `${wrong} Incorrect`
        }
        const rowNew = generateOptionButtons(mission, true, correct);
        interaction.editReply({ embeds: [embed], components: [rowNew] });
    })
}

function generateOptionButtons(mission:any, disabled=false, won=false, timeout=false) {
    const row = new MessageActionRow();
    for (let opt_i in mission.options) {
        row.addComponents(
            new MessageButton()
                .setCustomId(+opt_i == mission.correct ? 'correct' : `wrong${opt_i}`)
                // @ts-ignore +opt_i + 1 is defenitely 1 or 2 or 3
                .setEmoji(emojiOpts[+opt_i + 1])
                .setStyle(disabled && !timeout ? (+opt_i == mission.correct ? (won ? 'SUCCESS' : 'DANGER') : 'SECONDARY') : 'SECONDARY')
                .setDisabled(disabled)
        )
    }
    return row;
}

function optionsText(options:string[]) {
    let string = '';
    for (let opt_i in options) {
        const opt = options[opt_i];
        // @ts-ignore opt_i + 1 is defenitely 1 or 2 or 3
        string += `**${emojiOpts[+opt_i + 1]}** ${opt}\n`
    }
    return string;
}