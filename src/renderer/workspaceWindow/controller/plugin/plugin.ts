import { ipcRenderer, WebviewTag } from 'electron';
import { getCurrentInstance, ref, nextTick } from 'vue';
import sysBus from '../systemBus';
import path from 'path';
import { uuid, extend } from 'licia';
import api from './api';
import panelManager from '../panelManager';
import { ElMessage } from 'element-plus';
const TAG = '[SaltDogPlugin]';
class SaltDogPlugin {
    private _basicInfo: any = {};
    private _sidebarIconList: any = [];
    private _sidebarViews: any = ref([]);
    private _sidebarViewsMap: Map<string, any> = new Map(); // plugin.view--->index in _sidebarViews
    private _sidebarViewsUUIDMap: Map<string, any> = new Map();
    // @ts-ignore
    private windowId;
    public init(basicInfo: any, windowId: any): void {
        this._basicInfo = basicInfo;
        this.windowId = windowId;
        console.log(TAG, 'basicInfo', this._basicInfo);
        ipcRenderer.on('PLUGINWEBVIEW_INVOKE_CALLBACK', (event: any, data: any) => {
            const webview = this._sidebarViewsUUIDMap.get(data.webviewId);
            webview.send('PLUGINWEBVIEW_INVOKE_CALLBACK', data);
        });
        ipcRenderer.on('PLUGINHOST_INVOKE', (event: any, data: any) => {
            if (api[data.api]) {
                // 注入传来的data
                api[data.api].call(data, data.args, (res: any) => {
                    if (data.callbackMainId) {
                        ipcRenderer.send(data.callbackMainId, res);
                    }
                });
            } else {
                console.error(TAG, 'api not found', data.api);
            }
        });
        // sysBus.on('onClickSidebarIcon', (cmd) => {
        //     this.loadSidebarViews(cmd);
        // });
        sysBus.on('onTabsChange', (tabid) => {
            console.log('onTabsChange');
            ipcRenderer.send('onTabsChange', tabid);
        });
    }
    public getSidebarIconListRef(): any {
        const buildinIconPath = __static + '/images/workspace';
        const iconList = [
            {
                iconImg: `${buildinIconPath}/library.svg`,
                description: '图书馆',
                active: false,
                command: 'onClickSidebarIcon:saltdog.library',
            },
            {
                iconImg: `${buildinIconPath}/content.svg`,
                description: '目录',
                active: false,
                command: 'onClickSidebarIcon:saltdog.outline',
            },
            {
                iconImg: `${buildinIconPath}/search.svg`,
                description: '搜索',
                active: false,
                command: 'onClickSidebarIcon:saltdog.search',
            },
        ];
        if (this._basicInfo) {
            for (const plugin in this._basicInfo) {
                if (this._basicInfo[plugin].sidebarIcon) {
                    this._basicInfo[plugin].sidebarIcon.forEach((icon: any) => {
                        iconList.push({
                            iconImg: icon.iconPath,
                            description: icon.description,
                            active: false,
                            command: `onClickSidebarIcon:${icon.command}`,
                        });
                    });
                }
            }
        }
        this._sidebarIconList = ref(iconList);
        return this._sidebarIconList;
    }
    public getSidebarViewsRef() {
        return this._sidebarViews;
    }
    private _buildInPluginSidebarGenerator(viewName: string) {
        const knownBuildInPlugins = {
            'saltdog.library': '图书馆',
            'saltdog.outline': '目录',
            'saltdog.search': '搜索',
        };
        // @ts-ignore
        if (!knownBuildInPlugins[viewName]) {
            // 安全检查
            console.error(`[Sidebar Plugin] Invalid build in plugin ${viewName}`);
            return false;
        }
        const alreadyLoadedViewsLen = this._sidebarViews.value.length;
        console.log(`[Sidebar Plugin] Generate Buildin Plugins ${viewName}`);

        this._sidebarViewsMap.set(viewName, alreadyLoadedViewsLen); // 记录下标
        const id = uuid();
        const viewinfo = {
            id: `sidebarView_${alreadyLoadedViewsLen}`,
            isBuildIn: true,
            viewName,
            viewSrc: ``,
            // @ts-ignore
            name: knownBuildInPlugins[viewName],
            show: true,
            uuid: id,
        };
        this._sidebarViews.value.push(viewinfo);
        // 关闭其他的webview-show
        // show出webview
        for (let i = 0; i < this._sidebarViews.value.length; i++) {
            this._sidebarViews.value[i].show = i == alreadyLoadedViewsLen;
        }
        console.log(`[Sidebar Plugin] Sidebar views info`, viewinfo);
    }
    // 新增webview（插件激活时）
    public loadSidebarViews(viewName: string, isReload = false) {
        if (!viewName.startsWith('onClickSidebarIcon:')) {
            console.warn(`[Sidebar Plugin] load sidebar without 'onCLickSidebarIcon',cmd:${viewName}`);
        } else {
            viewName = viewName.replace('onClickSidebarIcon:', '');
        }
        //viewname = pluginName.viewName
        if (!isReload && this._sidebarViewsMap.has(viewName)) {
            console.log(`[Sidebar Plugin] Already has sidebar views ${viewName}`);
            // show出webview
            const thisview = this._sidebarViewsMap.get(viewName);
            for (let i = 0; i < this._sidebarViews.value.length; i++) {
                this._sidebarViews.value[i].show = i == thisview;
            }
            return true;
        } else {
            const alreadyLoadedViewsLen = this._sidebarViews.value.length;
            if (viewName.split('.')[0] == 'saltdog') {
                // BuildIn Plugins
                this._buildInPluginSidebarGenerator(viewName);
                return true;
            }
            console.log(`[Sidebar Plugin] First load sidebar views ${viewName}`);
            const _view = this._basicInfo[viewName.split('.')[0]].views[viewName.split('.')[1]][0]; // TODO: 可能有多个view,暂时只支持一个

            this._sidebarViewsMap.set(viewName, alreadyLoadedViewsLen); // 记录下标
            const id = uuid();
            const viewinfo = {
                id: `sidebarView_${alreadyLoadedViewsLen}`,
                isBuildIn: false,
                viewName,
                viewSrc: `${_view.src.split('?')[0]}?windowId=${this.windowId}&webviewId=${id}&name=${_view.name}`,
                name: _view.name,
                show: true,
                uuid: id,
            };
            this._sidebarViews.value.push(viewinfo);
            // 关闭其他的webview-show
            // show出webview
            for (let i = 0; i < this._sidebarViews.value.length; i++) {
                this._sidebarViews.value[i].show = i == alreadyLoadedViewsLen;
            }
            console.log(`[Sidebar Plugin] Sidebar views info`, viewinfo);
        }
    }
    // 注册webview事件
    public registerSidebarView(webview: WebviewTag) {
        const viewUUID = webview.dataset.uuid || '';
        webview.addEventListener('dom-ready', () => {
            console.log('[Sidebar View] Dom Ready');
            const cssPath = path
                .normalize(__static + '/preloads/pluginWebviewPreload/sidebar.css')
                .replaceAll('\\', '/');

            console.log('Inject CSS', cssPath);
            webview.executeJavaScript(`
                const css=document.createElement('link');
                css.rel="stylesheet";
                css.type="text/css";
                css.href="${cssPath}";
                document.head.appendChild(css);
                // 避免结构化克隆报错，加;0
                ;0
            `);
            const jsPath = path.normalize(__static + '/preloads/pluginWebviewPreload/sidebar.js').replaceAll('\\', '/');
            console.log('Inject JS', jsPath);
            webview.executeJavaScript(`
                const js=document.createElement('script');
                js.src='${jsPath}';
                document.head.appendChild(js);
                // 避免结构化克隆报错，加;0
                ;0
            `);

            const viewInfo = this._sidebarViews.value.filter((v: any) => {
                return (v.uuid = viewUUID);
            })[0];

            this._sidebarViewsUUIDMap.set(viewUUID, webview);
            if (process.env.NODE_ENV === 'development') webview.openDevTools();
        });

        webview.addEventListener('ipc-message', (event) => {
            // console.log('[Sidebar View]', event.channel, event.args);
            ipcRenderer.send(event.channel, event.args);
        });
    }

    public getSidebarByName(name: string): WebviewTag | null {
        return this._sidebarViews.value[this._sidebarViewsMap.get(name)];
    }

    public restartPlugin(name: string): void {
        // 重启pluginHost
        name = name.split('.')[0];
        const result = ipcRenderer.sendSync('restartPlugin', { name });
        if (!result) {
            ElMessage({
                message: `插件[${name}]宿主重启失败`,
                type: 'error',
            });
            console.error(TAG, `MainProcess restartPlugin failed, see main process log for more info.`);
            return;
        }
        ElMessage({
            message: `插件[${name}]宿主重启成功`,
            type: 'success',
        });
    }
}
export default new SaltDogPlugin();
