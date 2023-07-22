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
exports.twirlTimer = exports.register = void 0;
const User_js_1 = __importDefault(require("../schema/User.js"));
function register(member) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield User_js_1.default.create({
            username: member.user.username,
            id: member.id,
            started: member.joinedTimestamp
        });
    });
}
exports.register = register;
;
function findHigestPosition(wrt, list, found = -1) {
    var _a;
    if (list.length == 0)
        return found;
    if (list[0] >= wrt)
        list.shift();
    if (list[0] < wrt) {
        if (list[0] > found)
            found = (_a = list.shift()) !== null && _a !== void 0 ? _a : 0;
        else
            list.shift();
    }
    return findHigestPosition(wrt, list, found);
}
function twirlTimer(text) {
    let P = ["\\", "|", "/", "-"];
    let x = 0;
    return setInterval(() => {
        process.stdout.write(`\r[` + P[x++] + `][${text}]`);
        x &= 3;
    }, 250);
}
exports.twirlTimer = twirlTimer;
;
