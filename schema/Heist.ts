import mongoose from "mongoose";

const heistSchema = new mongoose.Schema({
    id: String,
    members: [{ type:String, default: [] }]
});

const Heist = mongoose.model('heist', heistSchema);
export default Heist;