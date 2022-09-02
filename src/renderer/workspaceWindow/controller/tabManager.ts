import { ref, getCurrentInstance } from 'vue';
import { ipcRenderer } from 'electron';
import { noop, uniqueId } from 'lodash';
import { ITabConfig, ITabManager } from '@/utils/panelTab';
import MessageHandler from '../components/tabs/messageHandler';
import path from 'path';
import { existsSync } from 'fs-extra';
// FIXME:
import bus from './systemBus';
import SaltDogMessageChannelRenderer from './messageChannel';
import { uuid } from 'licia';
import ReaderManager from './reader';
import { Action, ElMessage, ElMessageBox, ElNotification } from 'element-plus';
import { setReadHistory } from './library';
const TAG = '[Renderer/TabManager]';
class MainTabManager implements ITabManager {
    private _eventList = [
        'load-commit',
        'did-finish-load',
        'did-fail-load',
        'did-frame-finish-load',
        'did-start-loading',
        'did-stop-loading',
        'did-attach',
        'dom-ready',
        'page-title-updated',
        'page-favicon-updated',
        'enter-html-full-screen',
        'leave-html-full-screen',
        'console-message',
        'found-in-page',
        'new-window',
        'will-navigate',
        'did-start-navigation',
        'did-redirect-navigation',
        'did-navigate',
        'did-frame-navigate',
        'did-navigate-in-page',
        'close',
        'ipc-message',
        'crashed',
        'plugin-crashed',
        'destroyed',
        'media-started-playing',
        'media-paused',
        'did-change-theme-color',
        'update-target-url',
        'devtools-opened',
        'devtools-closed',
        'devtools-focused',
        'context-menu',
    ];
    private currentTab = ref('');
    private tabList = ref<Array<ITabConfig>>([]);
    private messageHandler: any;
    private webviewMap = new Map<string, Electron.WebviewTag>();
    private webviewMessageHandler = new Map<string, MessageHandler>();
    private webviewId2Info = new Map<string, any>();
    private webviewPendingFunction = {}; // {"MainPanelWebview-1":[fn1,fn2]}
    private pdfTabReadyState = {}; // {"MainPanelWebview-1":false}
    constructor() {
        console.log(TAG, 'Inited');
        SaltDogMessageChannelRenderer.getInstance().registerCommand('saltdog.openNewPDF', () => {
            this.pickAndOpenPDF();
        });
    }
    public pickAndOpenPDF() {
        ipcRenderer.send('openFileDialog', {});
        ipcRenderer.once('openFileDialogReply', (e, arg) => {
            if (!arg.canceled && arg.filePaths.length != 0) {
                console.log(TAG, 'Open new PDF file', arg.filePaths);
                for (const p of arg.filePaths) {
                    // 打开PDF
                    this.addPdfTab(path.basename(p || '未命名'), p);
                }
            }
        });
    }
    public getCurrentTabRef(): any {
        return this.currentTab;
    }
    public getTabListRef(): any {
        return this.tabList;
    }
    public getCurrentTab(): string {
        return this.currentTab.value;
    }
    public getTabList(): Array<any> {
        return this.tabList.value;
    }
    public getWebviewById(id: string): Electron.WebviewTag | null {
        if (this.webviewMap.has(id)) return this.webviewMap.get(id) as Electron.WebviewTag;
        else return null;
    }
    public getInfoById(id: string): any | null {
        const target = this.getTabList().filter((info) => {
            return info.name == id;
        });
        if (target.length != 0) return target[0];
        else return null;
    }
    public setCurrentTab(tabId: string): void {
        SaltDogMessageChannelRenderer.getInstance().publish(
            'saltdog.setWindowTitle',
            this.webviewId2Info.get(tabId).title || ''
        );
        this.currentTab.value = tabId;
    }
    public getTabInfo(id: string): any {
        return this.webviewId2Info.get(id);
    }
    public getMessageHandler(id: string): MessageHandler | undefined {
        return this.webviewMessageHandler.get(id);
    }
    public whenPdfTabReady(tabid: string, fn: any) {
        if (!tabid || !fn || typeof fn != 'function') return;
        if (this.pdfTabReadyState[tabid] && this.pdfTabReadyState) {
            fn();
        } else {
            if (!this.webviewPendingFunction[tabid]) this.webviewPendingFunction[tabid] = [];
            this.webviewPendingFunction[tabid].push(fn);
        }
    }
    public addPdfTab(tabName: string, pdfPath: string, itemInfo = null) {
        if (!pdfPath) {
            console.error(TAG, 'Can not create pdf tab: No pdfPath');
        }
        if (!existsSync(pdfPath)) {
            ElNotification({
                title: '打开失败',
                message: 'PDF文件找不到啦😭，可能是文件被移动或删除。',
                type: 'error',
            });
            return;
        }
        // if (!itemInfo) {
        //     ElMessage('未导入的PDF不支持图表/文献识别。若要使用此功能请先导入您的论文库！');
        // }
        const name = tabName;
        const tabid = this.addTab(name, 'PDFVIEWER');
        this.pdfTabReadyState[tabid] = false;
        bus.once(`PDFVIEW_${tabid}:SDPDFCore_Ready`, () => {
            const handler = this.getMessageHandler(tabid) as MessageHandler;

            handler.invokeWebview(
                'loadPdf',
                {
                    filePath: pdfPath,
                    itemInfo,
                },
                (msg: any) => {
                    console.log(`Load PDF Result:${msg}`);
                }
            );
            if (this.webviewPendingFunction[tabid] && this.webviewPendingFunction[tabid].length != 0) {
                for (const i in this.webviewPendingFunction[tabid]) {
                    if (
                        this.webviewPendingFunction[tabid][i] &&
                        typeof this.webviewPendingFunction[tabid][i] == 'function'
                    ) {
                        this.webviewPendingFunction[tabid][i]();
                        delete this.webviewPendingFunction[tabid][i];
                    }
                }
                delete this.webviewPendingFunction[tabid];
            }
            this.pdfTabReadyState[tabid] = true;
            // handler.invokeWebview('jumpToTarget', '_OPENTOPIC_TOC_PROCESSING_d114e60114');
        });
        setReadHistory(tabName, pdfPath);
        //
        // bus.on(`PDFVIEW_${tabid}:_WebviewContentEvent`, (args) => {
        //     console.log(TAG, 'Custom Event dispatch', args);
        //     pluginMsgChannel.send(`Webview_${tabid}_contentEvent:${args.id}`, args.data);
        // });
        return tabid;
    }
    // 插件创建页面Tab
    public addPluginTab(pluginMessage: any, title: string, webviewUrl: string, statCallback: any) {
        const name = title;
        const tabid = this.addTab(name, webviewUrl);
        // statCallback(tabid);
        bus.once(`${tabid}_domReady`, () => {
            statCallback(tabid);
        });
    }

    // 添加tab
    public addTab(title: string, webviewUrl: string, type = 'webview', args = {}): string {
        const id = uuid();
        const baseInfo = {
            title,
            name: id,
            isPdf: webviewUrl == 'PDFVIEWER',
            type,
            webviewUrl:
                webviewUrl == 'PDFVIEWER'
                    ? `${'file:///' + __static}/sdpdfcore/index.html?webviewId=${id}`
                    : webviewUrl,
            webviewId: id,
            args,
        };
        this.getTabList().push(baseInfo);
        this.webviewId2Info.set(id, baseInfo);
        this.setCurrentTab(id);
        return id;
    }

    private _dealRemove(name: string) {
        const tabs = this.tabList.value;
        let activeName = this.currentTab.value;
        if (activeName === name) {
            tabs.forEach((tab, index) => {
                if (tab.name === name) {
                    const nextTab = tabs[index + 1] || tabs[index - 1];
                    if (nextTab) {
                        activeName = nextTab.name;
                    }
                }
            });
        }
        this.currentTab.value = activeName;
        this.tabList.value = tabs.filter((tab) => tab.name !== name);
        if (this.webviewMap.has(name)) this.webviewMap.delete(name);
    }
    public removeTab(name: string) {
        return new Promise((resolve, reject) => {
            const tabInfo = this.getInfoById(name);
            if (tabInfo && tabInfo.isPdf) {
                const modified = ReaderManager.getInstance().checkIfModified(name);
                if (modified) {
                    ElMessageBox.confirm('文件已经修改，是否保存？', '提示', {
                        distinguishCancelAndClose: true,
                        confirmButtonText: '保存',
                        cancelButtonText: '忽略更改',
                    })
                        .then(() => {
                            // save
                            ReaderManager.getInstance()
                                .saveChanges(name)
                                .then(() => {
                                    ReaderManager.getInstance().distroyReader(name);
                                    this._dealRemove(name);
                                    resolve(true);
                                })
                                .catch(() => {
                                    ElMessage.error('保存失败，可能是数据库损坏，请联系开发人员');
                                    reject(false);
                                });
                        })
                        .catch((action: Action) => {
                            if (action === 'close') return;
                            // 不保存，直接关闭
                            ReaderManager.getInstance().distroyReader(name);
                            this._dealRemove(name);
                            resolve(true);
                        });
                } else {
                    ReaderManager.getInstance().distroyReader(name);
                    this._dealRemove(name);
                    resolve(true);
                }
            } else {
                this._dealRemove(name);
                resolve(true);
            }
        });
    }
    onMounted() {
        if (this.tabList.value.length == 0) return;
        else {
            this.tabList.value.map((v) => {
                this.addWebviewTabEventListener(v);
            });
        }
    }
    public onBeforeUpdate() {
        console.log('beforeUpdate');
    }
    public onUpdated() {
        if (this.tabList.value.length == 0) return;
        else {
            const newWebviews = this.tabList.value.filter((item) => {
                return !this.webviewMap.has(item.webviewId);
            });
            newWebviews.map((v) => {
                this.addWebviewTabEventListener(v);
            });
        }
    }
    private addWebviewTabEventListener(v: ITabConfig) {
        const element = document.getElementById(v.webviewId) as Electron.WebviewTag;
        if (!element) return;
        if (!this.webviewMap.has(v.webviewId)) {
            this.webviewMap.set(v.webviewId, element);
            // 事件转发
            for (const e of this._eventList) {
                element.addEventListener(e, (...args) => {
                    SaltDogMessageChannelRenderer.getInstance().publish(
                        'webview.webviewNative',
                        JSON.parse(
                            JSON.stringify({
                                webviewId: v.webviewId,
                                event: e,
                                data: args,
                            })
                        )
                    );
                    // pluginMsgChannel.send(`Webview_${v.webviewId}_${e}`, args);
                });
            }
            element.addEventListener('dom-ready', () => {
                if (!this.webviewMessageHandler.has(v.webviewId)) {
                    this.webviewMessageHandler.set(v.webviewId, new MessageHandler(element));
                }
                bus.emit(`${v.webviewId}_domReady`);
                if (v.isPdf) {
                    ReaderManager.getInstance().setReader(
                        v.webviewId,
                        element,
                        this.getMessageHandler(v.webviewId) as MessageHandler
                    );
                    // element.addEventListener('will-navigate', (e) => {
                    //     console.log(e.url);
                    //     e.preventDefault();
                    // });
                }
                if (process.env.NODE_ENV === 'development') element.openDevTools();
            });
            element.addEventListener('console-message', (e) => {
                console.log('[webview]: ', e.message);
            });
        }
    }
}
export default new MainTabManager();
