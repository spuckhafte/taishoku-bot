import { showcase } from '../data/emojis.json'
import { SelectMenuArgs } from "../types";

export default async (args: SelectMenuArgs) => {
    const interaction = args.Interaction;
    const titleId = interaction.values[0];

    const member = interaction.guild?.members.cache.find(mem => mem.id == interaction.user.id);
    member?.roles.add(titleId);

    interaction.update({
        content: `**Title Assigned Successfully ${showcase}**`,
        embeds: interaction.message.embeds,
        components: []
    });
}