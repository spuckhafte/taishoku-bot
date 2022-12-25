import Discord, { Intents } from 'discord.js';
import mongoose from 'mongoose';

import User from './schema/User';
import CmdManager from './manager';
import dotenv from 'dotenv';
import intializeRamenVoteListener from './helpers/ramenVote';
import registerAll from './helpers/registerAll';

dotenv.config();
const Commando = new CmdManager('./commands', true);
mongoose.connect(process.env.DB ?? "");
const { socket, processVote } = intializeRamenVoteListener();

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
    console.log(`Logged in as ${client.user?.username}`);
    
    // await User.deleteMany({});
    // registerAll(client);
})

client.on('interactionCreate', async Interaction => {
    if (!Interaction.isCommand()) return;
    
    let cmdName = Interaction.commandName;
    Commando.run(cmdName, { Interaction });
});

socket.on('upvote', async data => {
    const votingData = await processVote(data);
})

client.login(process.env.TOKEN);

export default client;