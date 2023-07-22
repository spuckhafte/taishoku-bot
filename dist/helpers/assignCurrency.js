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
const User_js_1 = __importDefault(require("../schema/User.js"));
const updateDb_js_1 = __importDefault(require("./updateDb.js"));
function addFame(userId, where, fame, purchaseId = '') {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let user = yield User_js_1.default.findOne({ id: userId });
        if (!user)
            return;
        yield (0, updateDb_js_1.default)({ id: userId }, 'totalFame', +user.totalFame + fame);
        if (!where)
            return;
        let prevCash = (_a = user[where]) === null || _a === void 0 ? void 0 : _a.fameCollected;
        const finalActivitySpecificFame = (prevCash ? prevCash : 0) + fame;
        yield (0, updateDb_js_1.default)({ id: userId }, `${where}.fameCollected`, finalActivitySpecificFame);
        if (purchaseId)
            yield (0, updateDb_js_1.default)({ id: userId }, `purchaseHistory`, [...user.purchaseHistory, purchaseId]);
    });
}
;
function addElixir(userId, where, elixir, purchaseId = '') {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let user = yield User_js_1.default.findOne({ id: userId });
        if (!user)
            return;
        yield (0, updateDb_js_1.default)({ id: userId }, 'totalElixir', +user.totalElixir + elixir);
        if (!where)
            return;
        let prevCash = (_a = user[where]) === null || _a === void 0 ? void 0 : _a.elixirCollected;
        const finalActivitySpecificElixir = (prevCash ? prevCash : 0) + elixir;
        yield (0, updateDb_js_1.default)({ id: userId }, `${where}.elixirCollected`, finalActivitySpecificElixir);
        if (purchaseId)
            yield (0, updateDb_js_1.default)({ id: userId }, `purchaseHistory`, [...user.purchaseHistory, purchaseId]);
    });
}
;
function spendFame(userId, fame, purchaseId = '') {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let user = yield User_js_1.default.findOne({ id: userId });
        if (!user)
            return;
        yield (0, updateDb_js_1.default)({ id: userId }, 'totalFame', +user.totalFame - fame);
        let prevCash = (_a = user.spent) === null || _a === void 0 ? void 0 : _a.fameCollected;
        const finalActivitySpecificFame = (prevCash ? prevCash : 0) + fame;
        yield (0, updateDb_js_1.default)({ id: userId }, 'spent.fameCollected', finalActivitySpecificFame);
        if (purchaseId)
            yield (0, updateDb_js_1.default)({ id: userId }, `purchaseHistory`, [...user.purchaseHistory, purchaseId]);
    });
}
;
function spendElixir(userId, elixir, purchaseId = '') {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let user = yield User_js_1.default.findOne({ id: userId });
        if (!user)
            return;
        yield (0, updateDb_js_1.default)({ id: userId }, 'totalElixir', +user.totalElixir - elixir);
        let prevCash = (_a = user.spent) === null || _a === void 0 ? void 0 : _a.elixirCollected;
        const finalActivitySpecificElixir = (prevCash ? prevCash : 0) + elixir;
        yield (0, updateDb_js_1.default)({ id: userId }, 'spent.elixirCollected', finalActivitySpecificElixir);
        if (purchaseId)
            yield (0, updateDb_js_1.default)({ id: userId }, `purchaseHistory`, [...user.purchaseHistory, purchaseId]);
    });
}
;
exports.default = {
    fame: addFame,
    elixir: addElixir,
    spend: {
        fame: spendFame,
        elixir: spendElixir
    }
};
