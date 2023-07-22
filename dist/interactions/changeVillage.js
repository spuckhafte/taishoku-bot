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
const villages_json_1 = __importDefault(require("../data/villages.json"));
const emojis_json_1 = require("../data/emojis.json");
exports.default = (args) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const interaction = args.Interaction;
    const villageId = interaction.values[0];
    const member = (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.members.cache.find(mem => mem.id == interaction.user.id);
    const currentVillage = member === null || member === void 0 ? void 0 : member.roles.cache.filter(role => Object.values(villages_json_1.default).includes(role.id));
    if (currentVillage)
        yield (member === null || member === void 0 ? void 0 : member.roles.remove(currentVillage));
    yield (member === null || member === void 0 ? void 0 : member.roles.add(villageId));
    interaction.update({
        content: `**Village Transfer Successful ${emojis_json_1.showcase}**`,
        embeds: interaction.message.embeds,
        components: []
    });
});
