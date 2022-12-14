import { io } from "socket.io-client";
import { RAMEN_ID, RAMEN_VOTING_SYSTEM_SERVER } from "../data/impVar.json"
import Users from "../schema/User";
import updateDb from "./updateDb";

export default () => {
    const socket = io(RAMEN_VOTING_SYSTEM_SERVER);
    socket.emit('handshake', RAMEN_ID)
    socket.on('connected', ok => console.log(ok + ' -connected to RAMEN_VOTING_SYSTEM_SERVER'));
    return {
        socket,
        processVote
    }
};

async function processVote(data:any) {
    data = JSON.parse(data);
    let voterId:string = data.user;
    let user = await Users.findOne({ id: voterId });
    if (!user || !user.ramen || isNaN(user.ramen.votes)) {
        console.log('User does not exists')
        return 0;
    }
    updateDb({ id: voterId }, 'ramen.votes', user.ramen.votes + 1);
    return {
        voterId,
        votes: user.ramen.votes + 1
    }
};