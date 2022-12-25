import Users from '../schema/User';
import { Client } from 'discord.js';
import impVar from '../data/impVar.json'

export default async (client:Client):Promise<void> => {
    const server = await client.guilds.fetch(impVar.TAISHOKU_SERVER_ID);
    (await server.members.fetch()).forEach(async member => {
        // if (member.user.bot) return; for testing purposes

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