"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const heistSchema = new mongoose_1.default.Schema({
    id: String,
    members: [{ type: String, default: [] }]
});
const Heist = mongoose_1.default.model('heist', heistSchema);
exports.default = Heist;
