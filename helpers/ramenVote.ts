import { io } from "socket.io-client";
import { RAMEN_ID, RAMEN_VOTING_SYSTEM_SERVER } from '../data/impVar.json'
import Users from "../schema/User.js";
import client from "../server.js";
import updateDb from "./updateDb.js";

import { votingChannel } from '../data/settings.json'
import { rewards } from '../data/money.json'
import assignCurrency from "./assignCurrency.js";

export default () => {
    const socket = io(RAMEN_VOTING_SYSTEM_SERVER);
    socket.emit('handshake', RAMEN_ID)
    socket.on('connected', () => console.log('[connected to RAMEN_VOTING_SERVER]'));
    return {
        socket,
        processVote
    }
};

async function processVote(data: any) {
    data = JSON.parse(data);
    let voterId: string = data.user;
    let user = await Users.findOne({ id: voterId });
    if (!user || !user.ramen || isNaN(user.ramen.votes)) {
        console.log('[Voter does not exists in the guild]')
        return 0;
    }
    await updateDb({ id: voterId }, 'ramen.votes', user.ramen.votes + 1);
    assignCurrency.fame(voterId, 'ramen', rewards.votes);

    const chnl = client.channels.cache.find(chnl => chnl.id == votingChannel)
    if (chnl?.isText()) {
        chnl.send(`<@${voterId}> voted, assigned \`${rewards.votes}F\` to them, they've voted \`${user.ramen.votes + 1}\` times.`);
    }
};