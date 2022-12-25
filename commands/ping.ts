import { CmdoArgs } from '../types'

export default (args:CmdoArgs):void => {
    args.Interaction.reply({
        content: 'Pong!',
        ephemeral: true
    });
};