import { register } from "../helpers/registerAll.js";
import updateDb from "../helpers/updateDb.js";
import Users from "../schema/User.js";
import { CmdoArgs } from "../types";

export default async (args:CmdoArgs) => {
    const interaction = args.Interaction;
    const user = await Users.findOne({ id: interaction.user.id });
    if (!user) {
        const member = interaction.guild?.members.cache.find(mem => mem.id == interaction.user.id);
        if (!member) return;
        await register(member);
    } else {
        if (user.username?.trim() != interaction.user.username.trim())
            await updateDb({ id: user.id }, 'username', interaction.user.username);
    }
    await interaction.reply({
        content: "Done!",
        ephemeral: true
    });
}