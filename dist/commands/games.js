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
const coinflip_js_1 = __importDefault(require("../helpers/games/coinflip.js"));
const rps_js_1 = __importDefault(require("../helpers/games/rps.js"));
exports.default = (args) => __awaiter(void 0, void 0, void 0, function* () {
    const interaction = args.Interaction;
    const game = interaction.options.getSubcommand();
    const fame = interaction.options.getNumber('fame', false);
    const friend = interaction.options.getUser('against', false);
    if (game == 'coinflip') {
        if (!fame)
            return;
        (0, coinflip_js_1.default)(fame, interaction);
    }
    if (game == 'rps') {
        if (!fame || !friend)
            return;
        (0, rps_js_1.default)(fame, friend, interaction);
    }
});
