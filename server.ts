import Discord, { Intents } from 'discord.js';
import mongoose from 'mongoose';

import User from './schema/User.js';
import CmdManager from './manager';
import dotenv from 'dotenv';

dotenv.config();
const Commando = new CmdManager('./commands', true);
mongoose.connect(process.env.DB ?? "");

const client = new Discord.Client({
    intents: [
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, 
        Intents.FLAGS.GUILD_MEMBERS, 
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.MESSAGE_CONTENT
    ]
});

client.on('ready', async () => {
    console.log('connected');
})

client.on('interactionCreate', async Interaction => {
    if (!Interaction.isCommand()) return;
    
    let cmdName = Interaction.commandName;
    Commando.run(cmdName, { Interaction });
});

client.login(process.env.TOKEN);