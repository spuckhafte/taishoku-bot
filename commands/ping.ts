import { StdObject } from '../types'
import { CommandInteraction } from 'discord.js'

export default (args:StdObject):void => {
    const interaction:CommandInteraction = args.Interaction;
    interaction.reply({
        content: 'Pong!',
        ephemeral: true
    });
};