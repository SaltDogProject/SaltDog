import SaltDogMessageChannelMain from './apis/plugin/api/messageChannel';
const TAG = '[Main/Schema]';
export default function schemaParser(args: string) {
    if (!args || typeof args != 'string') return;
    if (!args.startsWith('saltdog://')) return;
    const content = args.substring('saltdog://'.length);
    const firstContent = content.split('/')[0];
    switch (firstContent) {
        case 'command':
            parseCommand(content.split('/').slice(1).join('/'));
            break;
        default:
            console.error(TAG, `Unsupport schema: ${args}`);
    }
}
function parseCommand(payload: string) {
    const cmd = payload.split('/')[0];
    const args = payload.split('/').slice(1).join('/');
    console.log(TAG, `Parse command: ${cmd}, args:${args}`);
    SaltDogMessageChannelMain.getInstance().publish(`onCommand:${cmd}`, args);
}
