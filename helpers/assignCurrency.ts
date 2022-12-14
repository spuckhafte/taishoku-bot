import Users from '../schema/User';
import { SchemaKeys } from '../types';
import updateDb from './updateDb';

export async function updateFame(userId:string, where:SchemaKeys, fame:number) {
    let user = await Users.findOne({ id: userId });
    if (!user) return;
    updateDb({ id: userId }, 'totalFame', user.totalFame + fame);

    const finalActivitySpecificFame = user[where]?.fameCollected ? user[where]?.fameCollected : 0 + fame;
    updateDb({ id:userId }, `${where}.fameCollected`, finalActivitySpecificFame);
};

export async function updateElixir(userId:string, where:SchemaKeys, elixir:number) {
    let user = await Users.findOne({ id: userId });
    if (!user) return;
    updateDb({ id: userId }, 'totalElixir', user.totalElixir + elixir);
    
    const finalAcitivitySpecificElixir = user[where]?.elixirCollected ? user[where]?.elixirCollected : 0 + elixir;
    updateDb({ id:userId }, `${where}.elixirCollected`, finalAcitivitySpecificElixir);
};