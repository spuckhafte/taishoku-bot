import Discord, { Intents } from 'discord.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import CmdManager from './manager.js';
import updateDb from './helpers/updateDb.js';
import { register } from './helpers/registerAll.js';
import intializeRamenVoteListener from './helpers/ramenVote.js';
import manageChat from './helpers/manageChat.js';
import Users from './schema/User.js';

dotenv.config();

const Commando = new CmdManager('commands', 'js');
const OtherInteractions = new CmdManager('interactions', 'js');
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
    // if (Interaction.channel) if (Interaction.channel.id != '1059766480033558579') return;
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
    if (member.user.bot) return;
    await register(member);
});

client.on('guildMemberRemove', async member => {
    if (member.user.bot) return;
    await Users.deleteOne({ id: member.id });
});

client.on('userUpdate', async (oldUser, newUser) => {
    if (oldUser.username == newUser.username) return;
    await updateDb({ id: newUser.id }, 'username', newUser.username);
});

client.on('messageCreate', async msg => {
    if (msg.author.bot) return;
    manageChat(msg);                
});

socket.on('upvote', async (data) => {
    await processVote(data);
});

socket.on('test', async data => {
    await processVote(data);
});

client.login(process.env.TOKEN);

export default client;
