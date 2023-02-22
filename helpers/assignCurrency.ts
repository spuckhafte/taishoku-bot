import Users from '../schema/User';
import { Purposes } from '../types';
import updateDb from './updateDb';

async function addFame(userId:string, where:Purposes, fame:number, purchaseId='') {
    let user = await Users.findOne({ id: userId });
    if (!user) return;
    await updateDb({ id: userId }, 'totalFame', +user.totalFame + fame);

    if (!where) return;

    let prevCash = user[where]?.fameCollected;
    const finalActivitySpecificFame = (prevCash ? prevCash : 0) + fame;
    await updateDb({ id:userId }, `${where}.fameCollected`, finalActivitySpecificFame);

    if (purchaseId) await updateDb({ id:userId }, `purchaseHistory`, [...user.purchaseHistory, purchaseId]);
};

async function addElixir(userId:string, where:Purposes, elixir:number, purchaseId='') {
    let user = await Users.findOne({ id: userId });
    if (!user) return;
    await updateDb({ id: userId }, 'totalElixir', +user.totalElixir + elixir);

    if (!where) return;
    
    let prevCash = user[where]?.elixirCollected
    const finalActivitySpecificElixir = (prevCash ? prevCash : 0) + elixir;
    await updateDb({ id:userId }, `${where}.elixirCollected`, finalActivitySpecificElixir);

    if (purchaseId) await updateDb({ id:userId }, `purchaseHistory`, [...user.purchaseHistory, purchaseId]);
};

async function spendFame(userId:string, fame:number, purchaseId='') {
    let user = await Users.findOne({ id: userId });
    if (!user) return;
    await updateDb({ id: userId }, 'totalFame', +user.totalFame - fame);

    let prevCash = user.spent?.fameCollected;
    const finalActivitySpecificFame = (prevCash ? prevCash : 0) + fame;
    await updateDb({ id:userId }, 'spent.fameCollected', finalActivitySpecificFame);

    if (purchaseId) await updateDb({ id:userId }, `purchaseHistory`, [...user.purchaseHistory, purchaseId]);
};

async function spendElixir(userId:string, elixir:number, purchaseId='') {
    let user = await Users.findOne({ id: userId });
    if (!user) return;
    await updateDb({ id: userId }, 'totalElixir', +user.totalElixir - elixir);
    
    let prevCash = user.spent?.elixirCollected;
    const finalActivitySpecificElixir = (prevCash ? prevCash : 0) + elixir;
    await updateDb({ id:userId }, 'spent.elixirCollected', finalActivitySpecificElixir);

    if (purchaseId) await updateDb({ id:userId }, `purchaseHistory`, [...user.purchaseHistory, purchaseId]);
};



export default {
    fame: addFame,
    elixir: addElixir,
    spend: {
        fame: spendFame,
        elixir: spendElixir
    }
};