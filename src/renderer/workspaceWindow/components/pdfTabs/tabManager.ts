import { ref } from 'vue';
import { PDFVIEWER_WEBVIEW_URL } from '@/utils/constants';
import { WebviewTag } from 'electron';
interface ITabConfig {
    title: string;
    name: string;
    webviewUrl: string;
    webviewId: string;
}
class MainTabManager {
    private currentTab = ref('1');
    private tabList = ref<Array<ITabConfig>>([
        {
            title: 'Test Document.pdf',
            name: '1',
            webviewId: `pdfWebview-1`,
            webviewUrl: PDFVIEWER_WEBVIEW_URL,
        },
    ]);
    private webviewMap = new Map<string, WebviewTag>();
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
    public addTab(title: string, name: string, webviewUrl: string): void {
        this.getTabList().push({
            title,
            name,
            webviewUrl,
            webviewId: `pdfWebview-${name}`,
        });
        this.setCurrentTab(name);
    }
    public removeTab(name: string) {
        console.log('removeTab', name);
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
    }
    onMounted() {
        if (this.tabList.value.length == 0) return;
        else {
            this.tabList.value.map((v) => {
                const element = document.getElementById(v.webviewId) as WebviewTag;
                if (!this.webviewMap.has(v.webviewId)) {
                    this.webviewMap.set(v.webviewId, element);
                    element.addEventListener('dom-ready', () => {
                        element.openDevTools();
                    });
                    element.addEventListener('console-message', (e) => {
                        console.log('[webview]: ' + e.message);
                    });
                }
            });
        }
    }
    public onBeforeUpdate() {
        console.log('beforeUpdate');
    }
    public onUpdated() {
        console.log('onUpdated');
        if (this.tabList.value.length == 0) return;
        else {
            const newWebviews = this.tabList.value.filter((item) => {
                return !this.webviewMap.has(item.webviewId);
            });
            newWebviews.map((v) => {
                const element = document.getElementById(v.webviewId) as WebviewTag;
                if (!this.webviewMap.has(v.webviewId)) {
                    this.webviewMap.set(v.webviewId, element);
                    element.addEventListener('dom-ready', () => {
                        element.openDevTools();
                    });
                    element.addEventListener('console-message', (e) => {
                        console.log('[webview]: ' + e.message);
                    });
                }
            });
        }
    }
}
export default new MainTabManager();
