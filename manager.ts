import { Manager, StdObject } from "./types";
import fs from 'fs';

class CmdManager {
    cmdRegister:Manager;

    constructor(folder:string, ts=false) {
        let fileType = ts ? '.ts' : '.js';
        fs.readdir(folder, (_, files) => {
            files.forEach(file => {
                if (file.endsWith(fileType)) {
                    const func:CallableFunction = require(`${folder}/${file}`).default;
                    let fileName = file.replace(fileType, '');
                    this.cmdRegister = { ...this.cmdRegister },
                    this.cmdRegister[fileName] = func;
                };
            })
        });
    };

    run = (cmdName:string, args:StdObject) => this.cmdRegister[cmdName](args);
};

export default CmdManager;