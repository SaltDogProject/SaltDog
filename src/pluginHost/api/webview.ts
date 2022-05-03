import SaltDogMessageChannelRenderer from '../messageChannel';
SaltDogMessageChannelRenderer.getInstance().subscribe('webview.webviewNative', (msg: any) => {
    const { webviewId, event, data } = msg;
    // console.log(`Webview Native Event: ${event} on webview ${webviewId} with`, data);
});
export default {};
