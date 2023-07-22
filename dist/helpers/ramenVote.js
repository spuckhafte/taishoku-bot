"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const impVar_json_1 = require("../data/impVar.json");
const User_js_1 = __importDefault(require("../schema/User.js"));
const server_js_1 = __importDefault(require("../server.js"));
const updateDb_js_1 = __importDefault(require("./updateDb.js"));
const settings_json_1 = require("../data/settings.json");
const money_json_1 = require("../data/money.json");
const assignCurrency_js_1 = __importDefault(require("./assignCurrency.js"));
exports.default = () => {
    const socket = (0, socket_io_client_1.io)(impVar_json_1.RAMEN_VOTING_SYSTEM_SERVER);
    socket.emit('handshake', impVar_json_1.RAMEN_ID);
    socket.on('connected', () => console.log('[connected to RAMEN_VOTING_SERVER]'));
    return {
        socket,
        processVote
    };
};
function processVote(data) {
    return __awaiter(this, void 0, void 0, function* () {
        data = JSON.parse(data);
        let voterId = data.user;
        let user = yield User_js_1.default.findOne({ id: voterId });
        if (!user || !user.ramen || isNaN(user.ramen.votes)) {
            console.log('[Voter does not exists in the guild]');
            return 0;
        }
        yield (0, updateDb_js_1.default)({ id: voterId }, 'ramen.votes', user.ramen.votes + 1);
        assignCurrency_js_1.default.fame(voterId, 'ramen', money_json_1.rewards.votes);
        const chnl = server_js_1.default.channels.cache.find(chnl => chnl.id == settings_json_1.votingChannel);
        if (chnl === null || chnl === void 0 ? void 0 : chnl.isText()) {
            chnl.send(`<@${voterId}> voted, assigned \`${money_json_1.rewards.votes}F\` to them, they've voted \`${user.ramen.votes + 1}\` times.`);
        }
    });
}
;
