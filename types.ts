type Manager = {
    [index: string]: CallableFunction
};

type StdObject = {
    [index: string]: any
}

type ExistingCmds = 'Ping';

export { Manager, ExistingCmds, StdObject };