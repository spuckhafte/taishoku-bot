import { Message, MessageEmbed } from "discord.js";
import { register } from "../helpers/registerAll.js";
import Users from "../schema/User.js";

import { rewards } from '../data/money.json'
import { timeRange } from "../helpers/toolbox.js";
import updateDb from "../helpers/updateDb.js";
import assignCurrency from "../helpers/assignCurrency.js";
import { chatLog } from '../data/settings.json'
import client from "../server.js";
import { chat } from '../data/emojis.json'

export default async (msg: Message) => {
    const author = msg.author;

    let user = await Users.findOne({ id: author.id });
    const member = (await msg.guild?.members.fetch())?.find(mem => mem.id == author.id);
    if (!member) return;
    if (!client.user) return;

    if (!user) {
        let newUser = await register(member);
        if (newUser) user = newUser;
    }
    if (!user) return;
    if (!user?.chat) {
        user.chat = {
            last: '0',
            perIntervalMsg: 0,
            fameCollected: 0,
            elixirCollected: 0
        }
        user = await user.save();
    }
    if (!user.chat) return;

    const deltaTime = timeRange(user.chat.last, Date.now());

    if (deltaTime.seconds >= rewards.chat.time) {
        await updateDb({ id: user.id }, 'chat.last', Date.now());

        const msgsWorthReward = user.chat.perIntervalMsg;
        await updateDb({ id: user.id }, 'chat.perIntervalMsg', 1);

        let reward = 0;

        if (msgsWorthReward >= rewards.chat.bp.a && msgsWorthReward < rewards.chat.bp.b)
            reward = rewards.chat.a;
        if (msgsWorthReward >= rewards.chat.bp.b && msgsWorthReward < rewards.chat.bp.c)
            reward = rewards.chat.b;
        if (msgsWorthReward >= rewards.chat.bp.c)
            reward = rewards.chat.c;

        if (reward == 0) return;
        await assignCurrency.fame(user.id, 'chat', reward);

        const chatLogChannel = client.channels.cache.find(ch => ch.id == chatLog);
        const embed = new MessageEmbed({
            title: `${chat} Chat Reward`,
            description: `**To:** ${author}\n**Reward:** \`${reward} Fame\``,
            thumbnail: { url: client.user.displayAvatarURL() },
            footer: {
                text: `${msg.createdAt.toString().replace(/\([A-Z a-z]+\)/g, '')}`,
                iconURL: author.displayAvatarURL()
            }
        });
        if (chatLogChannel?.isText()) await chatLogChannel.send({ embeds: [embed] });
    } else {
        await updateDb({ id: user.id }, 'chat.perIntervalMsg', user.chat.perIntervalMsg + 1);
    }

}