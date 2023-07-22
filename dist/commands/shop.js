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
const discord_js_1 = require("discord.js");
const server_js_1 = __importDefault(require("../server.js"));
const User_js_1 = __importDefault(require("../schema/User.js"));
const shop_json_1 = require("../data/shop.json");
const emojis_json_1 = require("../data/emojis.json");
const shopActions_js_1 = __importDefault(require("../helpers/shopActions.js"));
const NEVER_GONNA = 'https://www.youtube.com/watch?v=xvFZjo5PgG0';
exports.default = (args) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const interaction = args.Interaction;
    const discordUser = interaction.user;
    const user = yield User_js_1.default.findOne({ id: discordUser.id });
    const subCmd = interaction.options.getSubcommand();
    const itemId = interaction.options.getNumber('item', false);
    if (subCmd == 'list') {
        const embed = new discord_js_1.MessageEmbed({
            title: `${emojis_json_1.shopping} THE TAISHOKU STORE`,
            thumbnail: {
                url: (_a = server_js_1.default.user) === null || _a === void 0 ? void 0 : _a.displayAvatarURL()
            },
            footer: {
                text: 'use ( /shop buy ) to get an item using its id',
                iconURL: discordUser.displayAvatarURL()
            }
        });
        for (let item of shop_json_1.shop) {
            const field = generateField(item, user);
            if (!field)
                continue;
            embed.fields = [...embed.fields, field];
        }
        interaction.reply({ embeds: [embed] });
    }
    if (subCmd == 'buy') {
        const item = shop_json_1.shop.find(shopItem => +shopItem.id == itemId);
        if (!item) {
            interaction.reply({
                content: "No item of this id exists in store",
                ephemeral: true
            });
            return;
        }
        (0, shopActions_js_1.default)(item, interaction);
    }
});
function generateField(shopItem, user) {
    const userServices = user.inventory.services;
    const userGoods = user.inventory.goods;
    const prestigeIds = [6, 7, 8, 9, 10];
    let prestige = 0;
    if (prestigeIds.includes(+shopItem.id)) {
        for (let id of prestigeIds) {
            if (prestige != 0)
                break;
            if (userServices[id].bought == false) {
                prestige = id;
                break;
            }
        }
        prestige = prestige == 0 ? 11 : prestige;
    }
    if (prestige != 0 && +shopItem.id != prestige)
        return;
    const isMulti = shopItem.type == 'g'
        ? (typeof userGoods[shopItem.id].total == 'number' ? true : false)
        : false;
    const bought = !isMulti ? shopItem.type == 'g'
        ? userGoods[shopItem.id].bought
        : userServices[shopItem.id].bought
        : false;
    const data = {
        name: `${shopItem.name} - ${shopItem.id}`,
        value: ` **[⏣ ${shopItem.price}](${NEVER_GONNA}) ${bought ? `${emojis_json_1.lock}` : ''}**\n${shopItem.desc}`,
        inline: false
    };
    return data;
}
