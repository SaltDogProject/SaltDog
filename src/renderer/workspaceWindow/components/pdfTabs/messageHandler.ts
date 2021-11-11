import uniqId from 'licia/uniqId';
import { noop } from 'lodash';
export default class MessageHandler {
    private webview: Electron.WebviewTag;
    private callbacks: { [key: string]: (args: any[]) => void } = {};
    constructor(webview: Electron.WebviewTag) {
        this.webview = webview;
        this.messageHandler = this.messageHandler.bind(this);
        this.webview.addEventListener('ipc-message', this.messageHandler);
    }
    private messageHandler(msg: Electron.IpcMessageEvent): void {
        switch (msg.channel) {
            case 'WEBVIEW_INVOKE':
                this.webviewInvokeHandler(msg.args);
                break;
            case 'WEBVIEW_INVOKE_CALLBACK':
                this.webviewCallbackHandler(msg.args);
        }
    }
    public webviewInvokeHandler(args: any[]): void {
        noop();
        const arg = {
            data: {},
            callbackId: 0,
        };
        this.webview.send('HOST_INVOKE_CALLBACK', JSON.stringify(arg));
    }
    public webviewCallbackHandler(args: any[]): void {
        const arg = JSON.parse(args[0]);
        if (this.callbacks[arg.callbackId as string]) {
            this.callbacks[arg.callbackId as string](arg.data);
            delete this.callbacks[arg.callbackId as string];
        }
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public invokeWebview(method: string, data: any, callback: any): void {
        console.log('[invokeWebview]', method, data);
        const id = uniqId();
        if (callback && typeof callback == 'function') {
            this.callbacks[id] = callback;
        }
        const args = {
            data,
            method,
            callbackId: id,
        };
        this.webview.send('HOST_INVOKE', JSON.stringify(args));
    }
}
