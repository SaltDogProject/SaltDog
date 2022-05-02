import SaltDogMessageChannelRenderer from '../messageChannel';

function onTextSelect(fn: (text: string) => any) {
    SaltDogMessageChannelRenderer.getInstance().subscribe('reader.onTextSelect', (data: any) => {
        fn(data);
    });
}
export default {
    onTextSelect,
};
