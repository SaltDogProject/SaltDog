import { ITabManager } from '@/utils/panelTab';
import {
    initWindowResizeListener,
    initPrimarySecondaryPanelListener,
    initSideBarMainPanelListener,
    initBottomBarMainPanelListener,
} from './resize';
import { throttle } from 'lodash';
interface IPanelObject {
    htmlElement: HTMLDivElement;
    controller?: ITabManager;
    size?: {
        width: number;
        height: number;
    };
}
interface IPanels {
    sideBar: IPanelObject;
    sideBarIcon: IPanelObject;
    functionalZone: IPanelObject;
    mainPanel: IPanelObject;
    primaryPanel: IPanelObject;
    secondaryPanel: IPanelObject;
    bottomPanel: IPanelObject;
}
interface IResizeOptions {
    resizer: HTMLDivElement;
    outerContainer: HTMLDivElement;
}
interface IResizeDivs {
    sideBar2mainPanel: IResizeOptions;
    mainPanel2BottomPanel: IResizeOptions;
    primaryPanel2secondaryPanel: IResizeOptions;
}

class viewsManager {
    private mainPanel: IPanelObject | null;
    private primaryPanel: IPanelObject | null;
    private secondaryPanel: IPanelObject | null;
    private bottomPanel: IPanelObject | null;
    private sideBarIcon: IPanelObject | null;
    private functionalZone: IPanelObject | null;
    private sideBar: IPanelObject | null;
    private resizers: IResizeDivs | null;
    private isInit = false;
    private showSideBar = true;
    private showSecondaryPanel = true;
    private showBottomPanel = true;
    constructor() {
        this.resizers =
            this.sideBar =
            this.mainPanel =
            this.primaryPanel =
            this.secondaryPanel =
            this.bottomPanel =
            this.functionalZone =
            this.sideBarIcon =
                null;
    }
    public updateView() {
        this.sideBar!.htmlElement.style.height = `${this.sideBar!.size!.height}px`;
        this.sideBar!.htmlElement.style.width = `${this.sideBar!.size!.width}px`;
        this.mainPanel!.htmlElement.style.height = `${this.mainPanel!.size!.height}px`;
        this.mainPanel!.htmlElement.style.width = `${this.mainPanel!.size!.width}px`;
        this.primaryPanel!.htmlElement.style.height = `${this.primaryPanel!.size!.height}px`;
        this.primaryPanel!.htmlElement.style.width = `${this.primaryPanel!.size!.width}px`;
        this.secondaryPanel!.htmlElement.style.height = `${this.secondaryPanel!.size!.height}px`;
        this.secondaryPanel!.htmlElement.style.width = `${this.secondaryPanel!.size!.width}px`;
        this.bottomPanel!.htmlElement.style.height = `${this.bottomPanel!.size!.height}px`;
        this.bottomPanel!.htmlElement.style.width = `${this.bottomPanel!.size!.width}px`;
        this.functionalZone!.htmlElement.style.height = `${this.functionalZone!.size!.height}px`;
        this.functionalZone!.htmlElement.style.width = `${this.functionalZone!.size!.width}px`;
        this.sideBarIcon!.htmlElement.style.height = `${this.sideBarIcon!.size!.height}px`;
        this.sideBarIcon!.htmlElement.style.width = `${this.sideBarIcon!.size!.width}px`;
    }
    public init(panels: IPanels) {
        if (this.isInit) {
            console.log('[viewsManager] Double init');
        } else {
            this.sideBar = panels.sideBar;
            this.sideBar.size = {
                width: this.sideBar.htmlElement.getBoundingClientRect().width,
                height: this.sideBar.htmlElement.getBoundingClientRect().height,
            };
            this.mainPanel = panels.mainPanel;
            this.mainPanel.size = {
                width: this.mainPanel.htmlElement.getBoundingClientRect().width,
                height: this.mainPanel.htmlElement.getBoundingClientRect().height,
            };
            this.primaryPanel = panels.primaryPanel;
            this.primaryPanel.size = {
                width: this.primaryPanel.htmlElement.getBoundingClientRect().width,
                height: this.primaryPanel.htmlElement.getBoundingClientRect().height,
            };
            this.secondaryPanel = panels.secondaryPanel;
            this.secondaryPanel.size = {
                width: this.secondaryPanel.htmlElement.getBoundingClientRect().width,
                height: this.secondaryPanel.htmlElement.getBoundingClientRect().height,
            };
            this.bottomPanel = panels.bottomPanel;
            this.bottomPanel.size = {
                width: this.bottomPanel.htmlElement.getBoundingClientRect().width,
                height: this.bottomPanel.htmlElement.getBoundingClientRect().height,
            };
            this.functionalZone = panels.functionalZone;
            this.functionalZone.size = {
                width: this.functionalZone.htmlElement.getBoundingClientRect().width,
                height: this.functionalZone.htmlElement.getBoundingClientRect().height,
            };
            this.sideBarIcon = panels.sideBarIcon;
            this.sideBarIcon.size = {
                width: this.sideBarIcon.htmlElement.getBoundingClientRect().width,
                height: this.sideBarIcon.htmlElement.getBoundingClientRect().height,
            };
            this.isInit = true;
            this.updateView();
        }
    }
    public initResizeListener(resizers: IResizeDivs) {
        this.resizers = resizers;
        initWindowResizeListener.call(this);
        initSideBarMainPanelListener.call(this);
        initBottomBarMainPanelListener.call(this);
        initPrimarySecondaryPanelListener.call(this);
    }
}
export default new viewsManager();
