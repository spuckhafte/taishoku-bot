import Users from '../schema/User';
import { Purposes } from '../types';
import updateDb from './updateDb';

async function addFame(userId:string, where:Purposes, fame:number) {
    let user = await Users.findOne({ id: userId });
    if (!user) return;
    updateDb({ id: userId }, 'totalFame', +user.totalFame + fame);

    if (!where) return;

    let prevCash = user[where]?.fameCollected;
    const finalActivitySpecificFame = (prevCash ? prevCash : 0) + fame;
    updateDb({ id:userId }, `${where}.fameCollected`, finalActivitySpecificFame);
};

async function addElixir(userId:string, where:Purposes, elixir:number) {
    let user = await Users.findOne({ id: userId });
    if (!user) return;
    updateDb({ id: userId }, 'totalElixir', +user.totalElixir + elixir);

    if (!where) return;
    
    let prevCash = user[where]?.elixirCollected
    const finalActivitySpecificElixir = (prevCash ? prevCash : 0) + elixir;
    updateDb({ id:userId }, `${where}.elixirCollected`, finalActivitySpecificElixir);
};

async function spendFame(userId:string, fame:number) {
    let user = await Users.findOne({ id: userId });
    if (!user) return;
    updateDb({ id: userId }, 'totalFame', +user.totalFame - fame);

    let prevCash = user.spent?.fameCollected;
    const finalActivitySpecificFame = (prevCash ? prevCash : 0) + fame;
    updateDb({ id:userId }, 'spent.fameCollected', finalActivitySpecificFame);
};

async function spendElixir(userId:string, elixir:number) {
    let user = await Users.findOne({ id: userId });
    if (!user) return;
    updateDb({ id: userId }, 'totalElixir', +user.totalElixir - elixir);
    
    let prevCash = user.spent?.fameCollected;
    const finalActivitySpecificElixir = (prevCash ? prevCash : 0) + elixir;
    updateDb({ id:userId }, 'spent.elixirCollected', finalActivitySpecificElixir);
};



export default {
    fame: addFame,
    elixir: addElixir,
    spend: {
        fame: spendFame,
        elixir: spendElixir
    }
};