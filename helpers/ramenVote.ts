import { io } from "socket.io-client";
import Users from "../schema/User";
import client from "../server";
import updateDb from "./updateDb";

import { votingChannel } from '../data/settings.json'
import { rewards } from '../data/money.json'
import assignCurrency from "./assignCurrency";

export async function processVote(data:any) {
    let voterId:string = data.user;
    let user = await Users.findOne({ id: voterId });
    if (!user || !user.ramen || isNaN(user.ramen.votes)) {
        console.log('[Voter does not exists in the guild]')
        return 0;
    }
    updateDb({ id: voterId }, 'ramen.votes', user.ramen.votes + 1);
    assignCurrency.fame(voterId, 'ramen', rewards.votes);

    const chnl = client.channels.cache.find(chnl => chnl.id == votingChannel)
    if (chnl?.isText()) {
        chnl.send(`<@${voterId}> voted, assigned \`${rewards.votes}F\` to them, they've voted \`${user.ramen.votes + 1}\` times.`);
    }
};