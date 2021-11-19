import { ChildProcess } from 'child_process';
import { ISaltDogPluginMessageType } from '../constant';
class SaltDogMessageChannel {
    public pluginHost: ChildProcess;
    public pluginInfo: ISaltDogPluginInfo;
    public api: ISaltDogPluginApi;
    constructor(pluginHost: ChildProcess, pluginInfo: ISaltDogPluginInfo, api: ISaltDogPluginApi) {
        this.pluginHost = pluginHost;
        this.pluginInfo = pluginInfo;
        this.api = api;
        this.pluginHost.on('message', (msg: any) => {
            switch (msg.type as ISaltDogPluginMessageType) {
                case ISaltDogPluginMessageType.PLUGINHOST_INVOKE:
                    this.handlePluginHostInvoke(msg as ISaltDogPluginInvoke);
            }
        });
    }
    private handlePluginHostInvoke(msg: ISaltDogPluginInvoke): void {
        if (typeof this.api[msg.api] === 'function') {
            this.api[msg.api](msg.args, (data: any) => {
                this.pluginHost.send({
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
        this.pluginHost.send({
            type: ISaltDogPluginMessageType.HOST_EVENT,
            event,
            data,
        } as ISaltDogPluginHostEventToPlugin);
    }
}
export default SaltDogMessageChannel;
