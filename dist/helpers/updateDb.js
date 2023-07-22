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
exports.default = (query, updateWhat, updateValue, fetch = false) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let updateObj = {};
        let val;
        if (typeof updateValue == 'function') {
            const prevVal = yield User_js_1.default.findOne(query, [updateWhat]);
            val = updateValue(prevVal);
        }
        else
            val = updateValue;
        updateObj[updateWhat] = val;
        yield User_js_1.default.updateOne(query, updateObj);
        if (fetch)
            return (yield User_js_1.default.findOne(query));
    }
    catch (e) {
        console.log(e);
        return null;
    }
});
