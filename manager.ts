import { Manager, CmdoArgs } from "./types";
import fs from 'fs';

class CmdManager {
    ResgisteredCommands:Manager;

    constructor(folder:string, lang:'ts'|'js') {
        let fileType = '.' + lang;
        fs.readdir(folder, (_, files) => {
            files.forEach(file => {
                if (file.endsWith(fileType)) {
                    const func:CallableFunction = require(`${folder}/${file}`).default;
                    let fileName = file.replace(fileType, '');
                    this.ResgisteredCommands = { ...this.ResgisteredCommands },
                    this.ResgisteredCommands[fileName] = func;
                };
            })
        });
    };

    run = (cmdName:string, args:CmdoArgs) => this.ResgisteredCommands[cmdName](args);
};

export default CmdManager;