import uniqId from 'licia/uniqId';
import { noop } from 'lodash';
import { ipcRenderer } from 'electron';
import bus from '../../controller/systemBus';
import SaltDogMessageChannelRenderer from '../../controller/messageChannel';
import { getSDPDFCoreAnnotate } from '../../controller/library';
import path from 'path';
import { existsSync, readFileSync } from 'fs-extra';
const TAG = '[Renderer/WebviewMessageChannel]';
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
        const { method, data, callbackId } = args[0];
        switch (method) {
            case 'reader.getAnnotations':
                console.log(TAG, 'reader.getAnnotations', data);
                getSDPDFCoreAnnotate(data).then((res) => {
                    // console.log(TAG, 'reader.getAnnotations Reply', res);
                    this.webview.send('HOST_INVOKE_CALLBACK', {
                        data: res,
                        callbackId,
                    });
                });
                break;
            case 'reader.getGrobidCacheData':
                console.log(TAG, 'reader.getGrobidCacheData', data); // data:filepath
                SaltDogMessageChannelRenderer.getInstance().invokeMain('reader.getGrobidMarkerInfo', data, (res) => {
                    this.webview.send('HOST_INVOKE_CALLBACK', {
                        data: res,
                        callbackId,
                    });
                });

                break;
            case 'reader.floatGraphWindow':
                console.warn(TAG, 'reader.floatGraphWindow: not implemented', data); // data:filepath
                // SaltDogMessageChannelRenderer.getInstance().invokeMain('reader.getGrobidMarkerInfo', data, (res) => {
                //     this.webview.send('HOST_INVOKE_CALLBACK', {
                //         data: res,
                //         callbackId,
                //     });
                // });

                break;
        }
        // const arg = {
        //     data: {},
        //     callbackId: 0,
        // };
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
        if (args[0].isReader) {
            SaltDogMessageChannelRenderer.getInstance().publish(
                `reader.${args[0].event}`,
                args[0].data,
                args[0].webviewId
            );
            bus.emit(`PDFVIEW_${args[0].webviewId}:${args[0].event}`, args[0].data);
        }
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
