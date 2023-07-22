"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const usersSchema = new mongoose_1.default.Schema({
    username: String,
    id: String,
    started: Number,
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
        lastMission: {
            type: String,
            default: 0
        }
    },
    roles: {
        fameCollected: {
            type: Number,
            default: 0
        },
        elixirCollected: {
            type: Number,
            default: 0
        },
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
    noroot: {
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
            },
            11: {
                name: {
                    type: String,
                    default: "Add Bot"
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
    },
    sendCooldown: {
        type: String,
        default: '0'
    },
    games: {
        won: {
            type: Number,
            default: 0
        },
        coinflip: {
            type: String,
            default: '0'
        },
        rps: {
            type: String,
            default: '0'
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
    chat: {
        last: { type: String, default: '0' },
        perIntervalMsg: { type: Number, default: 0 },
        fameCollected: { type: Number, default: 0 },
        elixirCollected: { type: Number, default: 0 }
    },
    purchaseHistory: [{ type: String, default: [] }]
});
const Users = mongoose_1.default.model("users", usersSchema);
exports.default = Users;
