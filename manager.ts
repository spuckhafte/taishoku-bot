import { Manager, StdObject } from "./types";
import fs from 'fs';

class CmdManager {
    ResgisteredCommands:Manager;

    constructor(folder:string, ts=false) {
        let fileType = ts ? '.ts' : '.js';
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

    run = (cmdName:string, args:StdObject) => this.ResgisteredCommands[cmdName](args);
};

export default CmdManager;