import { ref, getCurrentInstance } from 'vue';
import { WebviewTag } from 'electron';
import { noop, uniqueId } from 'lodash';
import { ITabConfig, ITabManager } from '@/utils/panelTab';
import MessageHandler from './messageHandler';
import path from 'path';
import fs from 'fs';
// FIXME:
import bus from '../../controller/systemBus';
import pluginMsgChannel from '../../../utils/pluginMsgChannel';
const TAG = '[TabManager]'
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
    private webviewMap = new Map<string, WebviewTag>();
    private webviewMessageHandler = new Map<string, MessageHandler>();
    private webviewId2Info = new Map<string, any>();
    private webviewPendingFunction = {}; // {"MainPanelWebview-1":[fn1,fn2]}
    private pdfTabReadyState = {}; // {"MainPanelWebview-1":false}

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
    public getWebviewById(id: string): WebviewTag | null {
        if (this.webviewMap.has(id)) return this.webviewMap.get(id) as WebviewTag;
        else return null;
    }
    public setCurrentTab(tabName: string): void {
        this.currentTab.value = tabName;
    }
    public getMessageHandler(id: string): MessageHandler | undefined {
        return this.webviewMessageHandler.get(id);
    }
    public whenPdfTabReady(tabid:string,fn:any){
        if(!tabid||!fn||typeof fn !='function') return;
        if(this.pdfTabReadyState[tabid]&&this.pdfTabReadyState){
            fn();
        }else{
            this.webviewPendingFunction[tabid] = fn;
        }
    }
    public addPdfTab(tabName:string,pdfPath: string) {
        if(!pdfPath){
            console.error(TAG,'Can not create pdf tab: No pdfPath,check proxy.__workspaceInfo.pdfPath');
        }
    const name=tabName;        
        const tabid = this.addTab(name, 'PDFVIEWER', 'saltdog-internal');
        this.pdfTabReadyState[tabid]=false;
        bus.once(`PDFVIEW_${tabid}:SDPDFCore_Ready`, () => {
            const handler = this.getMessageHandler(tabid) as MessageHandler;
            
            handler.invokeWebview(
                'loadPdf',
                {
                    filePath: pdfPath,
                },
                (msg: any) => {
                    console.log(`Load PDF Result:${msg}`);
                }
            );
            if(this.webviewPendingFunction[tabid]&&this.webviewPendingFunction[tabid].length!=0){
                for(const i in this.webviewPendingFunction[tabid]){
                    if(this.webviewPendingFunction[tabid][i]&&typeof this.webviewPendingFunction[tabid][i]=='function'){
                        this.webviewPendingFunction[tabid][i]();
                        delete this.webviewPendingFunction[tabid][i];
                    }
                }
                delete this.webviewPendingFunction[tabid]
            }
            this.pdfTabReadyState[tabid]=true;
            // handler.invokeWebview('jumpToTarget', '_OPENTOPIC_TOC_PROCESSING_d114e60114');
        });
        //
        bus.on(`PDFVIEW_${tabid}_WebviewContentEvent`,(args)=>{
            pluginMsgChannel.send(args.owner,`Webview_${tabid}_contentEvent:${args.id}/${args.eventName}`,args.data);
        })
    }
    // 插件创建页面Tab
    public addPluginTab(pluginMessage: any, title: string, webviewUrl: string, statCallback: any) {
        const name = title;
        const tabid = this.addTab(name, webviewUrl, pluginMessage.hostIdentity);
        statCallback(tabid);
        // bus.once(`${tabid}_domReady`, () => {
        //     statCallback(tabid);
        // });
    }

    // 添加tab 设置owner为插件名字，只有名字一样才可以互相控制
    public addTab(title: string, webviewUrl: string, owner = 'saltdog-internal'): string {
        const id = uniqueId(`MainPanelWebview-`);
        this.getTabList().push({
            title,
            name: id,
            isPdf: webviewUrl == 'PDFVIEWER',
            owner,
            webviewUrl: webviewUrl == 'PDFVIEWER' ? `${__static}/sdpdfcore/index.html?webviewId=${id}` : webviewUrl,
            webviewId: id,
        });
        this.webviewId2Info.set(id, {
            owner,
        });
        this.setCurrentTab(id);
        return id;
    }

    public removeTab(name: string) {
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
        const element = document.getElementById(v.webviewId) as WebviewTag;
        if (!element) return;
        if (!this.webviewMap.has(v.webviewId)) {
            this.webviewMap.set(v.webviewId, element);

            // 事件转发
            for (const e of this._eventList) {
                element.addEventListener(e, (...args) => {
                    pluginMsgChannel.send(v.owner, `Webview_${v.webviewId}_${e}`, args);
                });
            }
            element.addEventListener('dom-ready', () => {
                if (!this.webviewMessageHandler.has(v.webviewId)) {
                    this.webviewMessageHandler.set(v.webviewId, new MessageHandler(element));
                }
                bus.emit(`${v.webviewId}_domReady`);
                element.openDevTools();
            });
            element.addEventListener('console-message', (e) => {
                console.log('[webview]: ' + e.message);
            });
            
        }
    }
}
export default new MainTabManager();
