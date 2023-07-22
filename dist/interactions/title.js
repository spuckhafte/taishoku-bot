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
Object.defineProperty(exports, "__esModule", { value: true });
const emojis_json_1 = require("../data/emojis.json");
exports.default = (args) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const interaction = args.Interaction;
    const titleId = interaction.values[0];
    const member = (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.members.cache.find(mem => mem.id == interaction.user.id);
    member === null || member === void 0 ? void 0 : member.roles.add(titleId);
    interaction.update({
        content: `**Title Assigned Successfully ${emojis_json_1.showcase}**`,
        embeds: interaction.message.embeds,
        components: []
    });
});
