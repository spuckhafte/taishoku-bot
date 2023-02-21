import coinflip from "../helpers/games/coinflip";
import { CmdoArgs } from "../types";

export default async (args:CmdoArgs) => {
    const interaction = args.Interaction;
    const game = interaction.options.getSubcommand();

    const coinflipFame = interaction.options.getNumber('fame', false)

    if (game == 'coinflip') {
        if (!coinflipFame) return;
        coinflip(coinflipFame, interaction);
    }
}