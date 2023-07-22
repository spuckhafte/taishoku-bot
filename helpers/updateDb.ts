import Users from '../schema/User.js';
import { StdObject } from '../types';

export default async (query:StdObject, updateWhat:string, updateValue:any, fetch=false) => {
    try {
        let updateObj:StdObject = {};
        let val;
        if (typeof updateValue == 'function') {
            const prevVal = await Users.findOne(query, [updateWhat]);
            val = updateValue(prevVal)
        } else val = updateValue;
        updateObj[updateWhat] = val;
        await Users.updateOne(query, updateObj);
        if (fetch) return (await Users.findOne(query));
    } catch (e) {
        console.log(e)
        return null;
    }
};