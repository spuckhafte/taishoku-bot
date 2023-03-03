import { CommandInteraction, ModalSubmitInteraction, SelectMenuInteraction } from 'discord.js'

export type Manager = {
    [index: string]: CallableFunction
};

export type StdObject = {
    [index: string]: any
}

export type CmdoArgs = {
    Interaction: CommandInteraction
}

export type SelectMenuArgs = {
    Interaction: SelectMenuInteraction
}

export type ModalArgs = {
    Interaction: ModalSubmitInteraction
}

export type FieldsArray = {
    name: string,
    value: string,
    inline: boolean
}

export type Shop = {
    name: string;
    desc: string;
    id: string;
    price: number;
    currency: string;
    type: string;
}

export type LbUser = {
    id: String,
    username: String,
}

export type GameResponse = {
    [index:string]: {
        [index:string]: string
    }
}

export type ExistingCmds = 'ping' | 'distribute' | 'profile';
export type Currencies = 'fame' | 'elixir';

export type Purposes = 'ramen'|'missions'|'roles'|'nitro'|'events'|'noroot'|'invites'|'games'|'chat';
export type LbParams = 'fame'|'elixir'|'missions'|'games'

export type Services = ["reminders"];
export type Goods = ["pvtChannels"];

export type Tiers = 'I' | 'II' | 'III' | 'IV' | 'V';