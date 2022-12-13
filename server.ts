import Discord, { Intents, Interaction } from 'discord.js';
import CmdManager from './manager';

import dotenv from 'dotenv';
dotenv.config();

const Commando = new CmdManager('./commands', true);

const client = new Discord.Client({
    intents: [
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, 
        Intents.FLAGS.GUILD_MEMBERS, 
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.MESSAGE_CONTENT
    ]
});

client.on('ready', () => {
    console.log('connected');
})

client.on('interactionCreate', async Interaction => {
    if (!Interaction.isCommand()) return;
    
    let cmdName = Interaction.commandName;
    Commando.run(cmdName, { Interaction });
});

client.login(process.env.TOKEN);