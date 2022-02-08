import { ref, getCurrentInstance } from 'vue';
import { PDFVIEWER_WEBVIEW_URL } from '@/utils/constants';
import { WebviewTag } from 'electron';
import { noop, uniqueId } from 'lodash';
import { ITabConfig, ITabManager } from '@/utils/panelTab';
import MessageHandler from './messageHandler';
import path from 'path';
// FIXME:
import bus from '../../controller/systemBus';

class MainTabManager implements ITabManager {
    private currentTab = ref('');
    private tabList = ref<Array<ITabConfig>>([]);
    private messageHandler: any;
    private webviewMap = new Map<string, WebviewTag>();
    private webviewMessageHandler = new Map<string, MessageHandler>();
    private webviewId2Info = new Map<string,any>();

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
    public setCurrentTab(tabName: string): void {
        this.currentTab.value = tabName;
    }
    public getMessageHandler(id: string): MessageHandler | undefined {
        return this.webviewMessageHandler.get(id);
    }
    public addPdfTab(pdfPath: string) {
        const name = path.basename(pdfPath || '未命名');
        const tabid = this.addTab(name, PDFVIEWER_WEBVIEW_URL,"saltdog-internal");
        bus.once(`${tabid}_domReady`, () => {
            const handler = this.getMessageHandler(tabid) as MessageHandler;
            handler.invokeWebview('loadPdf', { path: pdfPath }, () => {
                noop();
            });
        });
    }
    // 插件创建页面Tab
    public addPluginTab(pluginInfo:any,webviewUrl:string,statCallback:any){
        const name = "Plugin"
        const tabid = this.addTab(name, webviewUrl,"");
        bus.once(`${tabid}_domReady`, () => {
            statCallback(tabid);
        });
    }

    public addTab(title: string, webviewUrl: string,owner=""): string {
        const id = uniqueId(`MainPanelWebview-`);
        this.getTabList().push({
            title,
            name: id,
            webviewUrl,
            webviewId: id,
        });
        this.webviewId2Info.set(id,{
            owner
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
        if (!this.webviewMap.has(v.webviewId)) {
            this.webviewMap.set(v.webviewId, element);
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
