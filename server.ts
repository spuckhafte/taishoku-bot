import Discord, { Intents } from 'discord.js';
import mongoose from 'mongoose';

import CmdManager from './manager';
import dotenv from 'dotenv';
import updateDb from './helpers/updateDb';
import { register } from './helpers/registerAll';
import intializeRamenVoteListener from './helpers/ramenVote';
import manageChat from './commands/manageChat';

dotenv.config();

const Commando = new CmdManager('./commands', 'ts');
const OtherInteractions = new CmdManager('./interactions', 'ts');
const { socket, processVote } = intializeRamenVoteListener();

mongoose.set("strictQuery", false);
mongoose.connect(process.env.DB ?? "", (e) => console.log(e ? e : '[connected to db]'));


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

client.on('guildMemberAdd', async member => {
    await register(member);
})

client.on('userUpdate', async (oldUser, newUser) => {
    if (oldUser.username != newUser.username) return;
    await updateDb({ id: newUser.id }, 'username', newUser.username);
});

client.on('messageCreate', async msg => {
    if (msg.author.bot) return;
    manageChat(msg);                
})

socket.on('upvote', async data => {
    await processVote(data);
});

socket.on('test', async data => {
    await processVote(data);
});

client.login(process.env.TOKEN);

export default client;