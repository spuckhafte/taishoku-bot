import coinflip from "../helpers/games/coinflip";
import rps from "../helpers/games/rps";
import { CmdoArgs } from "../types";

export default async (args:CmdoArgs) => {
    const interaction = args.Interaction;
    const game = interaction.options.getSubcommand();

    const fame = interaction.options.getNumber('fame', false);
    const friend = interaction.options.getUser('against', false);

    if (game == 'coinflip') {
        if (!fame) return;
        coinflip(fame, interaction);
    }

    if (game == 'rps') {
        if (!fame || !friend) return;
        rps(fame, friend, interaction);
    }
}