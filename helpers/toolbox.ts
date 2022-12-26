import client from "../server";
import { TAISHOKU_SERVER_ID } from '../data/impVar.json'
import { GuildMember } from "discord.js";

export async function getUsersByRole (roleId:string, ignoreById:string[]=[], ignoreBots=true) {

    const server = await client.guilds.fetch(TAISHOKU_SERVER_ID);

    let memberCount = 0;
    let members:GuildMember[] = [];

    for (let member of (await server.members.fetch()).toJSON()) {
        if (ignoreBots) if (member.user.bot) continue;
        if (ignoreById.includes(member.id)) continue;

        if (member.roles.cache.map(role => role.id).includes(roleId)) {
            memberCount += 1;
            members.push(member)
        }
    };

    return {
        memberCount, 
        members
    }
}

export async function isUserOrRole(roleId:string) {

    const server = await client.guilds.fetch(TAISHOKU_SERVER_ID);

    let targetType:'user'|'role';
    try {
        await server.members.fetch(roleId);
        targetType = 'user';
    } catch (e) {
        targetType = 'role';
    }
    return targetType;
}

export function timeRange(from:string|undefined, till=Date.now()) {
    const deltaTime = till - +(from??0);
    return {
        seconds: deltaTime / 1000,
        minutes: deltaTime / (1000 * 60),
        hours: deltaTime / (1000 * 60**2),
        days: deltaTime / (1000 * (60**2) * 24),
        months: deltaTime / (1000 * (60**2) * 24 * 30),
        years: deltaTime / (1000 * (60**2) * 24 * 365),
        
        dayLiteral: deltaTime / (1000 * (60**2) * 24) < 1 ? "less than a day" 
                    : Math.floor((deltaTime / (1000 * (60**2) * 24))) + 
                    ` day${Math.floor(deltaTime / (1000 * (60**2) * 24)) > 1 ? 's' : ''}`
    }
}