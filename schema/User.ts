import mongoose from "mongoose";

const usersSchema = new mongoose.Schema({
    username: String,
    id: String,
    started: Number, // timestamp
    totalFame: Number,
    totalElixir: Number,

    ramen: {
        votes: Number,
        lastVote: Number,
        fameCollected: Number,
        elixirCollected: Number
    },

    nb: {
        fameCollected: Number,
        elixirCollected: Number
    },

    roles: {
        currentHighestRole: Number, // id
        when: Number,
        fameCollected: Number,
        elixirCollected: Number,

        prevHigestRoles: [{
            role: String,
            duration: Number,
            fameCollected: Number,
            elixirCollected: Number
        }]
    },

    nitro: {
        boosts: Number,
        purchased: Number,
        fameCollected: Number,
        elixirCollected: Number
    },

    events: {
        eventsWon: Number,
        fameCollected: Number,
        elixirCollected: Number,

        eventDetails: [{
            eventName: String,
            when: Number,
            rank: Number,
            fameCollected: Number,
            elixirCollected: Number
        }],
    }

});

const Users = mongoose.model("users", usersSchema);
export default Users;