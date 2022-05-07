import SaltDogMessageChannelRenderer from '../messageChannel';
import { has } from 'lodash';
class SideBarStatus {
    private static _instance: SideBarStatus;
    private _openStatus: Map<string, boolean> = new Map(); // viewname--->open status
    private _viewInfo: Map<string, any> = new Map(); // viewname--->info
    private _currentOpenView: string | null = null;
    public static getInstance() {
        if (!this._instance) {
            this._instance = new SideBarStatus();
        }
        return this._instance;
    }
    public isOpen(viewName: string) {
        if (this._openStatus.has(viewName)) {
            return this._openStatus.get(viewName);
        }
        return false;
    }
    public _setOpenStatus(viewName: string, status: boolean) {
        this._openStatus.set(viewName, status);
        if (this._currentOpenView) {
            SaltDogMessageChannelRenderer.getInstance().emit(`${this._currentOpenView}:close`);
        }
        if (status) {
            this._currentOpenView = viewName;
            SaltDogMessageChannelRenderer.getInstance().emit(`${this._currentOpenView}:open`);
        }
    }
    public _setViewInfo(viewName: string, info: any) {
        if (!this._viewInfo.has(viewName)) this._viewInfo.set(viewName, info);
    }
    public _clearOpenStatus() {
        SaltDogMessageChannelRenderer.getInstance().emit(`${this._currentOpenView}:close`);
        this._openStatus.clear();
        this._currentOpenView = null;
    }
}
SaltDogMessageChannelRenderer.getInstance().subscribe('sidebar.onChange', (msg) => {
    const { from, to } = msg;
    if (from && from.viewName) {
        SideBarStatus.getInstance()._setOpenStatus(from.viewName, false);
    }
    if (to && to.viewName) {
        SideBarStatus.getInstance()._setOpenStatus(to.viewName, true);
    }
    // SideBarStatus.getInstance()._setViewInfo(viewName, msg);
});
SaltDogMessageChannelRenderer.getInstance().subscribe('sidebar.sidebarMsg', (msg) => {
    const { webviewId, viewName, event, data } = msg;
    SaltDogMessageChannelRenderer.getInstance().emit(`sideBarEvent_${viewName}.${event}`, ...data);
});
SaltDogMessageChannelRenderer.getInstance().subscribe('saltdog.panelStatusChange', (msg) => {
    const { panel, visibility } = msg;
    if (panel == 'sideBar' && visibility == false) {
        SideBarStatus.getInstance()._clearOpenStatus();
    }
});

function getSidebarView(viewName: string) {
    const [p, v] = viewName.split('.');
    if (!has(window._plugins, `${p}.contributes.views.${v}`)) {
        console.warn(`Plugin ${p} with viewName ${v} not exist. Check manifest.json {contributes.views}`);
        return null;
    }
    function isOpen() {
        return SideBarStatus.getInstance().isOpen(viewName);
    }
    function onVisibilityChange(action: 'open' | 'close', callback: (...args: any) => any) {
        SaltDogMessageChannelRenderer.getInstance().on(`${viewName}:${action}`, callback);
    }
    function send(channel: string, ...args: any) {
        SaltDogMessageChannelRenderer.getInstance().publish(`sidebar.pluginHostMsg:${viewName}`, {
            channel,
            args,
        });
    }
    function on(channel: string, callback: (...args: any) => any) {
        SaltDogMessageChannelRenderer.getInstance().on(`sideBarEvent_${viewName}.${channel}`, callback);
    }
    return {
        isOpen,
        onVisibilityChange,
        send,
        on,
    };
}
// function isOpen(viewName: string) {
//     return SideBarStatus.getInstance().isOpen(viewName);
// }
// function onVisibilityChange(viewName: string, action: 'open' | 'close', callback: (...args: any) => any) {
//     SaltDogMessageChannelRenderer.getInstance().on(`${viewName}:${action}`, callback);
// }
// function send(viewName: string, channel: string, ...args: any) {
//     SaltDogMessageChannelRenderer.getInstance().publish(`sidebar.pluginHostMsg:${viewName}`, {
//         channel,
//         args,
//     });
// }
// function on(viewName: string, channel: string, callback: (...args: any) => any) {
//     SaltDogMessageChannelRenderer.getInstance().on(`sideBarEvent_${viewName}.${channel}`, callback);
// }
export default { getSidebarView }; //isOpen, send, on, onVisibilityChange };
