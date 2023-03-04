import { MessageEmbed } from "discord.js";
import { CmdoArgs } from "../types";
import { earning } from '../data/emojis.json';
import Users from "../schema/User";
import client from "../server";

export default async (args:CmdoArgs) => {
    const interaction = args.Interaction;
    const user = await Users.findOne({ id: interaction.user.id });

    if (!user) {
        await interaction.reply({
            content: "You are not registered, use `/register`",
            ephemeral: true
        });
        return;
    }

    const embed = new MessageEmbed({
        title: `${earning} Balance`,
        description: `**Fame:** \`${user.totalFame.toFixed(2)}\`\n**Elixir:** \`${user.totalElixir.toFixed(2)}\``,
        thumbnail: { url: client.user?.displayAvatarURL() },
        footer: {
            text: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL()
        }
    });
    try {
        await interaction.reply({ embeds: [embed] });
    } catch (e) { null }
}