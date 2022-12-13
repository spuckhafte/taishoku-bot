import Users from '../schema/User';
import { Client, User } from 'discord.js';

const TAISHOKU_SERVER_ID = '1011682272673533973';

export default async (client:Client) => {
    const server = await client.guilds.fetch(TAISHOKU_SERVER_ID);
    (await server.members.fetch()).forEach(async member => {
        if (member.user.bot) return;

        if ((await Users.findOne({ id: member.id }))) {
            console.log('user-exists');
            return;
        };

        await Users.create({
            username: member.user.username,
            id: member.id,
            started: Date.now()
        });
        console.log(member.user.username, ' in!');
    })
    console.log('done');
};