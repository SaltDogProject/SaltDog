import SaltDogMessageChannelRenderer from '../messageChannel';
SaltDogMessageChannelRenderer.getInstance().subscribe('sidebar:events', (msg) => {
    const { webviewId, webviewName, event, data } = msg;
});
export default {};
