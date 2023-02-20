import Discord, { Intents } from 'discord.js';
import mongoose from 'mongoose';

import User from './schema/User';
import CmdManager from './manager';
import dotenv from 'dotenv';
import intializeRamenVoteListener from './helpers/ramenVote';
import registerAll from './helpers/registerAll';

dotenv.config();

const Commando = new CmdManager('./commands', 'ts');
const OtherInteractions = new CmdManager('./interactions', 'ts');

mongoose.set("strictQuery", false);
mongoose.connect(process.env.DB ?? "", (e) => console.log(e ? e : '[connected to db]'));
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
    console.log(`[logged in as ${client.user?.username}]`);
    registerAll(10);
})

client.on('interactionCreate', async Interaction => {
    // if (Interaction.channel) if (Interaction.channel.id != '1077088818047483924') return;
    if (Interaction.isCommand()) {
        let cmdName = Interaction.commandName;
        Commando.run(cmdName, { Interaction });
    }

    if (Interaction.isSelectMenu()) {
        const menuId = Interaction.customId;
        OtherInteractions.run(menuId, { Interaction });
    }

    if (Interaction.isModalSubmit()) {
        const modalId = Interaction.customId;
        OtherInteractions.run(modalId, { Interaction });
    }
});

socket.on('upvote', async data => {
    await processVote(data);
});

client.login(process.env.TOKEN);

export default client;