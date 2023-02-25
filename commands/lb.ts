import Users from "../schema/User";
import { CmdoArgs, LbParams, StdObject } from "../types";

export default async (args:CmdoArgs) => {
    const interaction = args.Interaction;
    await interaction.deferReply();
    
    const lbType = interaction.options.getSubcommand()

    // @ts-ignore (lbType is defenitely LbParams type)
    const findQuery = queryForSorting(lbType);
    if (!findQuery) return;

    const sortQueryObject:StdObject = {};
    sortQueryObject[findQuery[1]] = -1;

    const allUsers = await Users.find({}, findQuery).sort(sortQueryObject);
    
}

function queryForSorting(type:LbParams) {
    if (type == 'fame' || type == 'elixir') {
        return ['id', `total${type.replace(type[0], type[0].toUpperCase())}`, 'username']
    } else {
        if (type == 'games') return ['id', 'games.won', 'username'];
        if (type == 'missions') return ['id', 'missions.missionsCompleted', 'username']
    }
}

function showPage(pageNo:number, all:any, id:string[], where:string) {
    const from = (pageNo - 1) * 10;
    const allUsers:StdObject[] = all.splice(from, 10);

    const userIndex = allUsers.findIndex(val => val.id == id);
    const userExists = userIndex > -1 ? true : false;

    const userPage = Math.floor(userIndex / 10);

    let desc = ``;
    for (let user_i in allUsers) {
        const user = allUsers[user_i];
        desc += `${user.id}**`
    }
}