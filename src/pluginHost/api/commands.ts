import SaltDogMessageChannelRenderer from '../messageChannel';
function registerCommand(command: string, callback: (...args: any) => any): any {
    SaltDogMessageChannelRenderer.getInstance().registerCommand(`onCommand:${command}`, callback);
}
function executeCommand(command: string, ...args: any): any {
    SaltDogMessageChannelRenderer.getInstance().execCommand(`onCommand:${command}`, ...args);
}

export default {
    registerCommand,
    executeCommand,
};
