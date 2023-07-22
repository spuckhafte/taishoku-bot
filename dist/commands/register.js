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
const registerAll_js_1 = require("../helpers/registerAll.js");
const updateDb_js_1 = __importDefault(require("../helpers/updateDb.js"));
const User_js_1 = __importDefault(require("../schema/User.js"));
exports.default = (args) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const interaction = args.Interaction;
    const user = yield User_js_1.default.findOne({ id: interaction.user.id });
    if (!user) {
        const member = (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.members.cache.find(mem => mem.id == interaction.user.id);
        if (!member)
            return;
        yield (0, registerAll_js_1.register)(member);
    }
    else {
        if (((_b = user.username) === null || _b === void 0 ? void 0 : _b.trim()) != interaction.user.username.trim())
            yield (0, updateDb_js_1.default)({ id: user.id }, 'username', interaction.user.username);
    }
    yield interaction.reply({
        content: "Done!",
        ephemeral: true
    });
});
