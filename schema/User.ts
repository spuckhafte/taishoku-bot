import mongoose from "mongoose";

const usersSchema = new mongoose.Schema({
    username: String,
    id: String,
    started: Number, // timestamp
    totalFame: {
        type: Number,
        default: 0
    },
    totalElixir: {
        type: Number,
        default: 0
    },

    ramen: {
        votes: {
            type: Number,
            default: 0
        },
        lastVote: {
            type: Number,
            default: 0
        },
        fameCollected: {
            type: Number,
            default: 0
        },
        elixirCollected: {
            type: Number,
            default: 0
        },
    },

    nb: {
        fameCollected: {
            type: Number,
            default: 0
        },
        elixirCollected: {
            type: Number,
            default: 0
        },
    },

    roles: {
        currentHighestRole: {
            type: Number,
            default: 0
        }, // id
        when: {
            type: Number,
            default: 0
        },
        fameCollected: {
            type: Number,
            default: 0
        },
        elixirCollected: {
            type: Number,
            default: 0
        },

        prevHigestRoles: {
            type: [{
                role: String,
                duration: Number,
                fameCollected: Number,
                elixirCollected: Number
            }],
            default: []
        }
    },

    nitro: {
        boosts: {
            type: Number,
            default: 0
        },
        purchased: {
            type: Number,
            default: 0
        },
        fameCollected: {
            type: Number,
            default: 0
        },
        elixirCollected: {
            type: Number,
            default: 0
        },
    },

    events: {
        eventsWon: {
            type: Number,
            default: 0
        },
        fameCollected: {
            type: Number,
            default: 0
        },
        elixirCollected: {
            type: Number,
            default: 0
        }
    },
    noroot: { // no root of purpose
        fameCollected: {
            type: Number,
            default: 0
        },
        elixirCollected: {
            type: Number,
            default: 0
        }
    },
    spent: {
        fameCollected: Number,
        elixirCollected: Number
    }
});

const Users = mongoose.model("users", usersSchema);
export default Users;