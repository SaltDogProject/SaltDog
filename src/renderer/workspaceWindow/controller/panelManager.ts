import { ITabManager } from '@/utils/panelTab';
import {
    initWindowResizeListener,
    initPrimarySecondaryPanelListener,
    initSideBarMainPanelListener,
    initBottomBarMainPanelListener,
} from './resize';
import { throttle } from 'lodash';
const TAG = '[PanelManager]';
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
interface IPanelOpenStatus {
    sideBar: boolean;
    bottomPanel: boolean;
    secondaryPanel: boolean;
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
    private isSideBarOpen = true;
    private isBottomPanelOpen = true;
    private isSecondaryPanelOpen = true;
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
    public showBottomPanel() {
        console.log(TAG, 'showBottomPanel');
        if (this.isBottomPanelOpen) return;
        const outer = this.resizers!.mainPanel2BottomPanel.outerContainer.getBoundingClientRect();
        const bottomPanelHeight = 200;
        const mainPanelHeight = outer.height - bottomPanelHeight;
        // -2 因为resizer占4个
        this.mainPanel!.size!.height = mainPanelHeight - 2;
        this.bottomPanel!.size!.height = bottomPanelHeight - 2;
        this.primaryPanel!.size!.height = mainPanelHeight - 2;
        this.secondaryPanel!.size!.height = mainPanelHeight - 2;
        this.bottomPanel!.size!.width = window.innerWidth - this.sideBarIcon!.size!.width;
        this.bottomPanel!.htmlElement.style.display = 'block';
        this.resizers!.mainPanel2BottomPanel.resizer.style.display = 'block';
        this.isBottomPanelOpen = true;
        this.updateView();
    }
    public closeBottomPanel() {
        console.log(TAG, 'closeBottomPanel');
        if (!this.isBottomPanelOpen) return;
        const outer = this.resizers!.mainPanel2BottomPanel.outerContainer.getBoundingClientRect();
        const bottomPanelHeight = this.bottomPanel!.size!.height + 4;
        const mainPanelHeight = outer.height - bottomPanelHeight;
        // -2 因为resizer占4个
        this.mainPanel!.size!.height = this.mainPanel!.size!.height + bottomPanelHeight;
        this.bottomPanel!.size!.height = 0;
        this.primaryPanel!.size!.height = this.primaryPanel!.size!.height + bottomPanelHeight;
        this.secondaryPanel!.size!.height = this.secondaryPanel!.size!.height + bottomPanelHeight;
        this.bottomPanel!.htmlElement.style.display = 'none';
        this.resizers!.mainPanel2BottomPanel.resizer.style.display = 'none';
        this.isBottomPanelOpen = false;
        this.updateView();
    }
    public showSideBar() {
        console.log(TAG, 'showSideBar');
        if (this.isSideBarOpen) return;
        this.isSideBarOpen = true;
        const outer = this.resizers!.sideBar2mainPanel.outerContainer.getBoundingClientRect();
        const sideBarWidth = 180;
        const mainPanelWidth = outer!.width - sideBarWidth;
        // -2 因为resizer占4个
        this.sideBar!.htmlElement.style.display = 'block';
        this.resizers!.sideBar2mainPanel.resizer.style.display = 'block';

        this.sideBar!.size!.width = sideBarWidth - 2;
        this.sideBar!.size!.height = window.innerHeight - 20 - 30;
        this.functionalZone!.size!.width = mainPanelWidth - 2;
        this.mainPanel!.size!.width = mainPanelWidth - 2;
        this.bottomPanel!.size!.width = mainPanelWidth - 2;
        this.primaryPanel!.size!.width = mainPanelWidth - this.secondaryPanel!.size!.width;

        this.updateView();
    }
    public closeSideBar() {
        console.log(TAG, 'closeSideBar');
        if (!this.isSideBarOpen) return;
        this.isSideBarOpen = false;
        const outer = this.resizers!.sideBar2mainPanel.outerContainer.getBoundingClientRect();
        // +4 resizer 宽度
        const sideBarWidth = this.sideBar!.size!.width + 4;
        const mainPanelWidth = outer!.width + sideBarWidth;
        // -2 因为resizer占4个
        this.sideBar!.htmlElement.style.display = 'none';
        this.resizers!.sideBar2mainPanel.resizer.style.display = 'none';
        this.sideBar!.size!.width = 0;
        // 20 bottom 30 标题
        this.sideBar!.size!.height = window.innerHeight - 20 - 30;
        this.functionalZone!.size!.width = this.functionalZone!.size!.width + sideBarWidth;
        this.mainPanel!.size!.width = this.mainPanel!.size!.width + sideBarWidth;
        this.bottomPanel!.size!.width = this.bottomPanel!.size!.width + sideBarWidth;
        this.primaryPanel!.size!.width = this.primaryPanel!.size!.width + sideBarWidth;
        this.updateView();
    }
    public showSecondaryPanel() {
        console.log(TAG, 'showSecondaryPanel');
        if (this.isSecondaryPanelOpen) return;
        this.isSecondaryPanelOpen = true;
        const outer = this.resizers!.primaryPanel2secondaryPanel.outerContainer.getBoundingClientRect();
        this.secondaryPanel!.htmlElement.style.display = 'block';
        this.resizers!.primaryPanel2secondaryPanel.resizer.style.display = 'block';
        const secondaryWidth = 200;
        const primaryWidth = outer!.width - secondaryWidth;
        // -2 因为resizer占4个
        this.primaryPanel!.size!.width = primaryWidth - 2;
        this.secondaryPanel!.size!.width = secondaryWidth - 2;
        this.secondaryPanel!.size!.height =
            window.innerHeight - 30 - 20 - (this.isBottomPanelOpen ? this.bottomPanel!.size!.height + 4 : 0);
        this.updateView();
    }
    public closeSecondaryPanel() {
        console.log(TAG, 'closeSecondaryPanel');
        if (!this.isSecondaryPanelOpen) return;
        this.isSecondaryPanelOpen = false;
        const outer = this.resizers!.primaryPanel2secondaryPanel.outerContainer.getBoundingClientRect();
        const secondaryWidth = this.secondaryPanel!.size!.width + 4;
        this.secondaryPanel!.htmlElement.style.display = 'none';
        this.resizers!.primaryPanel2secondaryPanel.resizer.style.display = 'none';
        // -2 因为resizer占4个
        this.primaryPanel!.size!.width = this.primaryPanel!.size!.width + secondaryWidth;
        this.secondaryPanel!.size!.width = 0;
        this.secondaryPanel!.size!.height =
            window.innerHeight - 30 - 20 - (this.isBottomPanelOpen ? this.bottomPanel!.size!.height + 4 : 0);
        this.updateView();
    }
    public init(panels: IPanels, openStatus: IPanelOpenStatus) {
        if (this.isInit) {
            console.log('[viewsManager] Double init');
        } else {
            this.isSideBarOpen = openStatus.sideBar;
            this.isSecondaryPanelOpen = openStatus.secondaryPanel;
            this.isBottomPanelOpen = openStatus.bottomPanel;

            this.sideBar = panels.sideBar;
            this.bottomPanel = panels.bottomPanel;
            if (!this.isBottomPanelOpen) {
                this.bottomPanel!.htmlElement.style.display = 'none';
                this.resizers!.mainPanel2BottomPanel.resizer.style.display = 'none';
            }
            this.bottomPanel.size = {
                width: this.bottomPanel.htmlElement.getBoundingClientRect().width,
                height: this.bottomPanel.htmlElement.getBoundingClientRect().height,
            };

            if (!this.isSideBarOpen) {
                this.sideBar!.htmlElement.style.display = 'none';
                this.resizers!.sideBar2mainPanel.resizer.style.display = 'none';
            }
            this.sideBar.size = {
                width: this.sideBar.htmlElement.getBoundingClientRect().width,
                height: this.sideBar.htmlElement.getBoundingClientRect().height,
            };
            this.mainPanel = panels.mainPanel;
            this.mainPanel.size = {
                width: this.mainPanel.htmlElement.getBoundingClientRect().width,
                height: this.mainPanel.htmlElement.getBoundingClientRect().height,
            };
            this.secondaryPanel = panels.secondaryPanel;
            if (!this.isSecondaryPanelOpen) {
                this.secondaryPanel!.htmlElement.style.display = 'none';
                this.resizers!.primaryPanel2secondaryPanel.resizer.style.display = 'none';
            }
            this.secondaryPanel.size = {
                width: this.secondaryPanel.htmlElement.getBoundingClientRect().width,
                height: this.secondaryPanel.htmlElement.getBoundingClientRect().height,
            };
            this.primaryPanel = panels.primaryPanel;
            this.primaryPanel.size = {
                width: this.primaryPanel.htmlElement.getBoundingClientRect().width,
                height: this.primaryPanel.htmlElement.getBoundingClientRect().height,
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
