import bus from '../bus';
function registerCommand(command:string,callback:(...args: any)=>any):any{
    bus.on(`onCommand:${command}`,callback);
}
function executeCommand(command:string, ...args: any):any{
    bus.emit(`onCommand:${command}`, ...args);
}

export default {
    registerCommand,
    executeCommand,
}
