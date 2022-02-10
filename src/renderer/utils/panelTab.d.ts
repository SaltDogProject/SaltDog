export interface ITabConfig {
    title: string;
    name: string;
    webviewUrl: string;
    webviewId: string;
    owner:string
}

export interface ITabManager {
    getCurrentTab: () => string;
    getTabList: () => Array<any>;
    setCurrentTab: (tabName: string) => void;
    addTab: (title: string, webviewUrl: string) => string;
    removeTab: (name: string) => void;
}
