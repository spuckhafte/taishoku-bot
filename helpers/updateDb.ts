import Users from '../schema/User';
import { StdObject } from '../types';

export default async (query:StdObject, updateWhat:string, updateValue:any) => {
    try {
        let updateObj:StdObject = {};
        updateObj[updateWhat] = updateValue;
        await Users.updateOne(query, updateObj);
        return (await Users.findOne(query));
    } catch (e) {
        console.log(e)
        return null;
    }
};