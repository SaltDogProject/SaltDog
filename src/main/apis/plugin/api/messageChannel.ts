import { ChildProcess } from 'child_process';
import { ipcMain } from 'electron';
import { ISaltDogPluginMessageType } from '../constant';
import { uuid } from 'licia';
import windowManager from '~/main/window/windowManager';
const TAG = '[SaltDogMessageChannel]';
class SaltDogMessageChannel {
    public pluginHost?: ChildProcess;
    public pluginInfo: ISaltDogPluginInfo;
    public api: ISaltDogPluginApi;
    private ticket: string;
    constructor(pluginInfo: ISaltDogPluginInfo, api: ISaltDogPluginApi) {
        this.pluginInfo = pluginInfo;
        this.api = api;
        this.ticket = uuid();
    }
    public bindHost(pluginHost: ChildProcess): void {
        this.pluginHost = pluginHost;
        this.pluginHost.on('message', (msg: any) => {
            switch (msg.type as ISaltDogPluginMessageType) {
                case ISaltDogPluginMessageType.PLUGINHOST_INVOKE:
                    this.handlePluginHostInvoke(msg as ISaltDogPluginInvoke);
                    break;
                case ISaltDogPluginMessageType.PLUGINWEBVIEW_INVOKE_CALLBACK:
                    this.sendToRenderer(msg as ISaltDogPluginWebviewInvokeCallback);
            }
        });
    }

    private handlePluginHostInvoke(msg: ISaltDogPluginInvoke): void {
        if (typeof this.api[msg.api] === 'function') {
            this.api[msg.api](msg.args, (data: any) => {
                this.pluginHost!.send({
                    type: ISaltDogPluginMessageType.PLUGINHOST_INVOKE_CALLBACK,
                    callbackId: msg.callbackId,
                    data,
                } as ISaltDogPluginInvokeCallback);
            });
        } else {
            console.error(
                `${this.pluginInfo.name}插件接口调用失败：尝试调用${msg.api}，参数为${JSON.stringify(msg.args)}`
            );
        }
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public publishEventToPluginHost(event: string, data: any): void {
        this.pluginHost!.send({
            type: ISaltDogPluginMessageType.HOST_EVENT,
            event,
            data,
        } as ISaltDogPluginHostEventToPlugin);
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public sendToPluginHost(data: any): void {
        this.pluginHost!.send(data);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public sendToRenderer(data: any): void {
        if (windowManager.getById(data.windowId)) {
            console.log(TAG, 'sendToRenderer', data);
            windowManager.getById(data.windowId)!.webContents.send(data.type, data);
        } else {
            console.error(TAG, 'wrong windowId: do not exist', data.windowId);
        }
    }

    public getTicket(): string {
        return this.ticket;
    }
}
export default SaltDogMessageChannel;
