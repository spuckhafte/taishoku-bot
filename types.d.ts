import { CommandInteraction } from 'discord.js'

export type Manager = {
    [index: string]: CallableFunction
};

export type StdObject = {
    [index: string]: any
}

export type CmdoArgs = {
    Interaction: CommandInteraction
}

export type ExistingCmds = 'ping' | 'distribute' | 'profile';
export type Currencies = 'fame' | 'elixir';

export type Purposes = 'ramen'|'missions'|'roles'|'nitro'|'events'|'noroot'|'invites'
