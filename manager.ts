import { Manager, CmdoArgs, SelectMenuArgs, ModalArgs } from "./types";
import fs from 'fs';

class CmdManager {
    ResgisteredCommands:Manager = {};

    constructor(folder:string, lang:'ts'|'js') {
        let fileType = '.' + lang;
        fs.readdir('./dist/' + folder, (_, files) => {
            for (let file of files) {
                if (file.endsWith(fileType)) {
                    const func:CallableFunction = require(`${process.cwd()}/dist/${folder}/${file}`).default;
                    let fileName = file.replace(fileType, '');
                    this.ResgisteredCommands = { ...this.ResgisteredCommands },
                    this.ResgisteredCommands[fileName] = func;
                };
            }
        });
    };

    run = (cmdName:string, args:CmdoArgs|SelectMenuArgs|ModalArgs) => {
        if (typeof this.ResgisteredCommands[cmdName] !== 'function') return;
        this.ResgisteredCommands[cmdName](args);
    }
};

export default CmdManager;