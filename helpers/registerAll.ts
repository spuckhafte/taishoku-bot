import Users from '../schema/User';
import client from '../server';
import impVar from '../data/impVar.json';
import { levelRoleIndicator, entryRole } from '../data/settings.json'


async function register():Promise<void> {
    const server = await client.guilds.fetch(impVar.TAISHOKU_SERVER_ID);
    (await server.members.fetch()).forEach(async member => {
        if (member.user.bot) return;
        if (!member.roles.cache.find(role => role.id == levelRoleIndicator)) {
            await member.roles.add(levelRoleIndicator);
            await member.roles.add(entryRole);
        }
        let levelSpecifierRolePosition = member.roles.cache.find(role => role.id == levelRoleIndicator)?.position;
        let rolesPosList = member.roles.cache.map(role => role.position);
        let highestRolePos = findHigestPosition(levelSpecifierRolePosition ?? 0, rolesPosList);
        let highestRole = member.roles.cache.find(role => role.position == highestRolePos);

        let user = await Users.findOne({ id: member.id });
        if (user) {

            if (user.username == member.user.username && user.roles?.currentHighestRole == highestRole?.id) return;

            user.username = member.user.username;
            if (!user.roles) return;
            user.roles.currentHighestRole = highestRole?.id;
            if (!user.roles.highestRole?.position) return;
            if (highestRolePos >= user.roles.highestRole.position) {
                user.roles.highestRole.position = highestRolePos;
                user.roles.highestWhen = `${Date.now()}`;
                user.roles.highestTill = '0';
            } else {
                if (user.roles.highestTill == '0') user.roles.highestTill = `${Date.now()}`;
            }
            await user.save();

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
};

export default (interval:number) => {
    setInterval(() => {
        register();
    }, interval * 1000);
    // twirlTimer(`updating users in every ${interval}s`)
    console.log(`updating users in every ${interval}s`)
}

function findHigestPosition(wrt:number, list:number[], found=-1):number {
    if (list.length == 0) return found;

    if (list[0] >= wrt) list.shift();
    if (list[0] < wrt) {
        if (list[0] > found) found = list.shift() ?? 0;
        else list.shift();
    }
    return findHigestPosition(wrt, list, found)
}

export function twirlTimer(text:string) {
    let P = ["\\", "|", "/", "-"];
    let x = 0;
    return setInterval(() => {
      process.stdout.write(`\r[` + P[x++] + `][${text}]`);
      x &= 3;
    }, 250);
};