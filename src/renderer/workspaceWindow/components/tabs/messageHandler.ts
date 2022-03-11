import uniqId from 'licia/uniqId';
import { noop } from 'lodash';
import { ipcRenderer } from 'electron';
import bus from '../../controller/systemBus';
import pluginMsgChannel from '../../../utils/pluginMsgChannel';
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
                break;
            case 'WEBVIEW_PUBLISH':
                this.webviewPublishHandler(msg.args);
                break;
        }
    }
    public webviewInvokeHandler(args: any[]): void {
        noop();
        const arg = {
            data: {},
            callbackId: 0,
        };
        this.webview.send('HOST_INVOKE_CALLBACK', arg);
    }
    public webviewCallbackHandler(args: any[]): void {
        const arg = args[0];
        if (this.callbacks[arg.callbackId as string]) {
            this.callbacks[arg.callbackId as string](arg.data);
            delete this.callbacks[arg.callbackId as string];
        } 
    }
    public webviewPublishHandler(args: any[]): void {
        console.log('webviewPublish', args[0]);
        // TODO:
        // 原封不动发送到系统bus
        bus.emit(args[0].event, args[0].data);
        ipcRenderer.send(args[0].event, args[0].data);
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public invokeWebview(method: string, data: any, callback?: any): void {
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
        this.webview.send('HOST_INVOKE', args);
    }
}
