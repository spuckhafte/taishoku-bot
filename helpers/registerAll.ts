import Users from '../schema/User';
import { Client } from 'discord.js';
import impVar from '../data/impVar.json';

const specifierRole = '«««««« ⴵⴵⴵ 𝕃𝕖𝕧𝕖𝕝 ℝ𝕠𝕝𝕖𝕤 ⴵⴵⴵ »»»»»»';

export default async (client:Client):Promise<void> => {
    const server = await client.guilds.fetch(impVar.TAISHOKU_SERVER_ID);
    (await server.members.fetch()).forEach(async member => {
        if (member.user.bot) return; //for testing purposes
        let levelSpecifierRolePosition = member.roles.cache.find(role => role.name == specifierRole)?.position;
        let rolesPosList = member.roles.cache.map(role => role.position);
        let highestRolePos = findHigestPosition(levelSpecifierRolePosition ?? 0, rolesPosList);
        let highestRole = member.roles.cache.find(role => role.position == highestRolePos);

        if ((await Users.findOne({ id: member.id }))) {
            console.log('user-exists');
            return;
        };

        await Users.create({
            username: member.user.username,
            id: member.id,
            started: member.joinedTimestamp,
            roles: {
                currentHighestRole: highestRole?.id, // id
                highestWhen: Date.now(),
                highestRole: {
                    id: highestRole?.id,
                    position: highestRolePos
                }
            }
        });
        // console.log(member.user.username, ' in!');
    })
    console.log('members added');
};

function findHigestPosition(wrt:number, list:number[], found=-1):number {
    if (list.length == 0) return found;

    if (list[0] >= wrt) list.shift();
    if (list[0] < wrt) {
        if (list[0] > found) found = list.shift() ?? 0;
        else list.shift();
    }
    return findHigestPosition(wrt, list, found)
}