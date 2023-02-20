import Users from '../schema/User';
import client from '../server';
import impVar from '../data/impVar.json';


async function register():Promise<void> {
    const server = await client.guilds.fetch(impVar.TAISHOKU_SERVER_ID);
    (await server.members.fetch()).forEach(async member => {
        if (member.user.bot) return;
        let user = await Users.findOne({ id: member.id });
        if (user) {
            user.username = member.user.username;
            await user.save();
            return;
        };

        await Users.create({
            username: member.user.username,
            id: member.id,
            started: member.joinedTimestamp
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