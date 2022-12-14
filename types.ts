type Manager = {
    [index: string]: CallableFunction
};

type StdObject = {
    [index: string]: any
}

type ExistingCmds = 'Ping';

type SchemaKeys = 'ramen'|'nb'|'roles'|'nitro'|'events';

export { Manager, ExistingCmds, StdObject, SchemaKeys };