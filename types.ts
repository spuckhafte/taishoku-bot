import { Channel } from 'discord.js'

type Manager = {
    [index: string]: CallableFunction
};

type StdObject = {
    [index: string]: any
}

type ExistingCmds = 'ping';

export { Manager, ExistingCmds, StdObject };