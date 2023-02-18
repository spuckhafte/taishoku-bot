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

    missions: {
        missionsCompleted: {
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

    roles: {
        currentHighestRole: String, // id
        highestWhen: String,
        highestTill: String,

        fameCollected: {
            type: Number,
            default: 0
        },
        elixirCollected: {
            type: Number,
            default: 0
        },

        highestRole: {
            position: Number,
            id: String
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
    invites: {
        total: {
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
    spent: {
        fameCollected: {
            type: Number,
            default: 0
        },
        elixirCollected: {
            type: Number,
            default: 0
        }
    },

    inventory: {
        services: {
            reminders: {
                type: Boolean,
                default: false
            },
            2: {
                name: {
                    type: String,
                    default: "Change Village"
                },
                bought: {
                    type: Boolean,
                    default: false
                }
            },
            4: {
                name: {
                    type: String,
                    default: "Rogue Ninja"
                },
                bought: {
                    type: Boolean,
                    default: false
                }
            },
            6: {
                name: {
                    type: String,
                    default: "Presitge I"
                },
                bought: {
                    type: Boolean,
                    default: false
                }
            },
            7: {
                name: {
                    type: String,
                    default: "Prestige II"
                },
                bought: {
                    type: Boolean,
                    default: false
                }
            },
            8: {
                name: {
                    type: String,
                    default: "Prestige III"
                },
                bought: {
                    type: Boolean,
                    default: false
                }
            },
            9: {
                name: {
                    type: String,
                    default: "Prestige IV"
                },
                bought: {
                    type: Boolean,
                    default: false
                }
            },
            10: {
                name: {
                    type: String,
                    default: "Prestige V"
                },
                bought: {
                    type: Boolean,
                    default: false
                }
            }
        },
        goods: {
            1: {
                name: {
                    type: String,
                    default: "Title"
                },
                bought: {
                    type: Boolean,
                    default: false
                }
            },
            3: {
                name: {
                    type: String,
                    default: "Personal Role"
                },
                total: {
                    type: Number,
                    default: 0
                }
            },
            5: {
                name: {
                    type: String,
                    default: "Personal Channel"
                },
                total: {
                    type: Number,
                    default: 0
                }
            }
        }
    },

    reminder: {
        daily: {
            type: String,
            default: 0
        },
        missions: {
            type: String,
            default: 0
        }
    }
});

const Users = mongoose.model("users", usersSchema);
export default Users;