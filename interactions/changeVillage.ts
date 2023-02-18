import { SelectMenuArgs } from "../types";
import villages from "../data/villages.json";
import { showcase } from '../data/emojis.json';

export default async (args:SelectMenuArgs) => {
    const interaction = args.Interaction;

    const villageId = interaction.values[0];
    
    const member = interaction.guild?.members.cache.find(mem => mem.id == interaction.user.id);
    const currentVillage = member?.roles.cache.filter(role => Object.values(villages).includes(role.id));

    if (currentVillage) member?.roles.remove(currentVillage);
    member?.roles.add(villageId);

    interaction.update({
        content: `**Village Transfer Successful ${showcase}**`,
        embeds: interaction.message.embeds,
        components: []
    });
}