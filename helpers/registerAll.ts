import Users from '../schema/User';
import client from '../server';
import impVar from '../data/impVar.json';
import { GuildMember } from 'discord.js';


export async function register(member:GuildMember) {
    await Users.create({
        username: member.user.username,
        id: member.id,
        started: member.joinedTimestamp
    });
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

export function twirlTimer(text:string) {
    let P = ["\\", "|", "/", "-"];
    let x = 0;
    return setInterval(() => {
      process.stdout.write(`\r[` + P[x++] + `][${text}]`);
      x &= 3;
    }, 250);
};