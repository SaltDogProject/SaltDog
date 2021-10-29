import { ITabManager } from '@/utils/panelTab';
import { throttle } from 'lodash';
interface IPanelObject {
    htmlElement: HTMLDivElement;
    controller?: ITabManager;
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
    public init(panels: IPanels) {
        if (this.isInit) {
            console.log('[viewsManager] Double init');
        } else {
            this.sideBar = panels.sideBar;
            this.mainPanel = panels.mainPanel;
            this.primaryPanel = panels.primaryPanel;
            this.secondaryPanel = panels.secondaryPanel;
            this.bottomPanel = panels.secondaryPanel;
            this.functionalZone = panels.functionalZone;
            this.sideBarIcon = panels.sideBarIcon;
            this.isInit = true;
        }
    }
    public initResizeListener(resizers: IResizeDivs) {
        this.resizers = resizers;
        this.initWindowResizeListener();
        this.initSideBarMainPanelListener();
    }
    private initWindowResizeListener() {
        const windowResizeHandler = throttle((e: UIEvent) => {
            const innerWidth = (e!.currentTarget as Window).innerWidth;
            // const innerHeight = (e!.currentTarget as Window).innerHeight;
            const updateWidth = innerWidth - this.sideBarIcon!.htmlElement.getBoundingClientRect().width;
            console.log('window resize', innerWidth, this.sideBarIcon!.htmlElement.getBoundingClientRect().width);
            this.functionalZone!.htmlElement.style.width = `100%`;
            this.resizers!.sideBar2mainPanel.outerContainer.style.width = `${updateWidth}px`;
        }, 100);
        window.addEventListener('resize', windowResizeHandler);
    }
    private initSideBarMainPanelListener() {
        const resizer = this.resizers?.sideBar2mainPanel.resizer;
        let outer: DOMRect;
        const movehandler = throttle((e: MouseEvent) => {
            const sideBarWidthStart = outer!.x;
            const sideBarWidthEnd = e.clientX;
            const sideBarWidth = sideBarWidthEnd - sideBarWidthStart > 150 ? sideBarWidthEnd - sideBarWidthStart : 150;
            const mainPanelWidth = outer!.width - sideBarWidth;
            this.sideBar!.htmlElement.style.width = `${sideBarWidth}px`;
            this.functionalZone!.htmlElement.style.width = `${mainPanelWidth}px`;
            console.log('mousemove', sideBarWidth, mainPanelWidth);
        }, 100);
        let downHandler = (e: MouseEvent) => {
            return;
        };
        const uphandler = (e: MouseEvent) => {
            console.log('mouseup,remove listener');
            document.removeEventListener('mousedown', downHandler);
            document.removeEventListener('mousemove', movehandler);
            document.removeEventListener('mouseup', uphandler);
            this.sideBar!.htmlElement.style.pointerEvents = 'auto';
            this.mainPanel!.htmlElement.style.pointerEvents = 'auto';
            e.stopPropagation();
        };
        downHandler = (e: MouseEvent) => {
            this.sideBar!.htmlElement.style.pointerEvents = 'none';
            this.mainPanel!.htmlElement.style.pointerEvents = 'none';
            outer = this.resizers!.sideBar2mainPanel.outerContainer.getBoundingClientRect();
            console.log('[PanelManager] SideBarMainPanel resizing.');
            document.addEventListener('mousemove', movehandler);
            document.addEventListener('mouseup', uphandler);
        };
        resizer?.addEventListener('mousedown', downHandler);
    }
}
export default new viewsManager();
