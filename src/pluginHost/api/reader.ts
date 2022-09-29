import SaltDogMessageChannelRenderer from '../messageChannel';
const textSelectFns: Array<(text: string) => any> = [];
SaltDogMessageChannelRenderer.getInstance().subscribe('reader.onTextSelect', (data: any) => {
    for (const a of textSelectFns) {
        if (typeof a == 'function') a(data);
    }
});
function onTextSelect(fn: (text: string) => any) {
    textSelectFns.push(fn);
}
export default {
    onTextSelect,
};
