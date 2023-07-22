"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class CmdManager {
    constructor(folder, lang) {
        this.ResgisteredCommands = {};
        this.run = (cmdName, args) => {
            if (typeof this.ResgisteredCommands[cmdName] !== 'function')
                return;
            this.ResgisteredCommands[cmdName](args);
        };
        let fileType = '.' + lang;
        fs_1.default.readdir('./dist/' + folder, (_, files) => {
            for (let file of files) {
                if (file.endsWith(fileType)) {
                    const func = require(`${process.cwd()}/dist/${folder}/${file}`).default;
                    let fileName = file.replace(fileType, '');
                    this.ResgisteredCommands = Object.assign({}, this.ResgisteredCommands),
                        this.ResgisteredCommands[fileName] = func;
                }
                ;
            }
        });
    }
    ;
}
;
exports.default = CmdManager;
