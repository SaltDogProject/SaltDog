// @ts-nocheck
import { functionsIn, throttle } from 'lodash';

export function initWindowResizeListener(): void {
    const windowResizeHandler = throttle((e: UIEvent) => {
        const innerWidth = (e!.currentTarget as Window).innerWidth;
        const innerHeight = (e!.currentTarget as Window).innerHeight;
        this.primaryPanel!.size.width = updateWidth;
        // 30 标题栏高 20 bottombar高
        const updateHeight =
            innerHeight - 30 - 20 - this.bottomPanel!.size.height - 4 + (this.isBottomPanelOpen ? 0 : 4);
        const updateWidth =
            innerWidth -
            this.sideBarIcon!.size.width -
            this.sideBar!.size.width -
            4 +
            (this.isSideBarOpen ? 0 : 4) +
            (this.isSecondaryPanelOpen ? 0 : 4);
        this.primaryPanel!.size.height = updateHeight;
        this.secondaryPanel!.size.height = updateHeight;
        this.sideBarIcon!.size.height = innerHeight - 30 - 20;
        //this.resizer!.sideBar2mainPanel!.outerContainer!.style.width = `${innerHeight - 30 - 20}px`;
        this.resizers!.sideBar2mainPanel!.outerContainer!.style.height = `${innerHeight - 30 - 20}px`;
        this.functionalZone!.size.height = innerHeight - 30 - 20;
        this.functionalZone!.size.width = updateWidth;
        this.mainPanel!.size.width = updateWidth;
        this.bottomPanel!.size.width = updateWidth;
        this.mainPanel!.size.height = updateHeight;
        this.sideBar!.size.height = innerHeight - 30 - 20;
        this.primaryPanel!.size.width = updateWidth - this.secondaryPanel!.size.width - 2;
        this.updateView();
    }, 100);
    window.addEventListener('resize', windowResizeHandler);
}
export function initSideBarMainPanelListener(): void {
    const resizer = this.resizers?.sideBar2mainPanel.resizer;
    let outer: DOMRect;
    const movehandler = throttle((e: MouseEvent) => {
        const sideBarWidthStart = outer!.x;
        const sideBarWidthEnd = e.clientX;
        const sideBarWidth = sideBarWidthEnd - sideBarWidthStart > 150 ? sideBarWidthEnd - sideBarWidthStart : 150;
        const mainPanelWidth = outer!.width - sideBarWidth;
        // -2 因为resizer占4个
        this.sideBar!.size.width = sideBarWidth - 2;
        this.functionalZone!.size.width = mainPanelWidth - 2;
        this.mainPanel!.size.width = mainPanelWidth - 2;
        this.bottomPanel!.size.width = mainPanelWidth - 2;
        this.primaryPanel!.size.width = mainPanelWidth - this.secondaryPanel!.size.width;
        this.updateView();
    }, 100);
    let downHandler = (e: MouseEvent) => {
        return;
    };
    const uphandler = (e: MouseEvent) => {
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

export function initBottomBarMainPanelListener(): void {
    const resizer = this.resizers?.mainPanel2BottomPanel.resizer;
    let outer: DOMRect;
    const movehandler = throttle((e: MouseEvent) => {
        const bottomPanelHeightEnd = outer!.y + outer.height;
        const bottomPanelHeightStart = e.clientY;
        const bottomPanelHeight =
            bottomPanelHeightEnd - bottomPanelHeightStart < 150 ? 150 : bottomPanelHeightEnd - bottomPanelHeightStart;
        const mainPanelHeight = outer.height - bottomPanelHeight;
        // -2 因为resizer占4个
        this.mainPanel!.size.height = mainPanelHeight - 2;
        this.bottomPanel!.size.height = bottomPanelHeight - 2;
        this.primaryPanel!.size.height = mainPanelHeight - 2;
        this.secondaryPanel!.size.height = mainPanelHeight - 2;
        this.updateView();
    }, 100);
    let downHandler = (e: MouseEvent) => {
        return;
    };
    const uphandler = (e: MouseEvent) => {
        console.log('[PanelManager] Mouseup, remove listener');
        document.removeEventListener('mousedown', downHandler);
        document.removeEventListener('mousemove', movehandler);
        document.removeEventListener('mouseup', uphandler);
        this.sideBar!.htmlElement.style.pointerEvents = 'auto';
        this.mainPanel!.htmlElement.style.pointerEvents = 'auto';
        this.bottomPanel!.htmlElement.style.pointerEvents = 'auto';
        e.stopPropagation();
    };
    downHandler = (e: MouseEvent) => {
        this.sideBar!.htmlElement.style.pointerEvents = 'none';
        this.mainPanel!.htmlElement.style.pointerEvents = 'none';
        this.bottomPanel!.htmlElement.style.pointerEvents = 'none';
        outer = this.resizers!.mainPanel2BottomPanel.outerContainer.getBoundingClientRect();
        console.log('[PanelManager] MainPanelBottomPanel resizing.');
        document.addEventListener('mousemove', movehandler);
        document.addEventListener('mouseup', uphandler);
    };
    resizer?.addEventListener('mousedown', downHandler);
}
export function initPrimarySecondaryPanelListener(): void {
    const resizer = this.resizers?.primaryPanel2secondaryPanel.resizer;
    let outer: DOMRect;
    const movehandler = throttle((e: MouseEvent) => {
        const secondaryWidthStart = e.clientX;
        const secondaryWidthEnd = outer!.x + outer!.width;
        const secondaryWidth =
            secondaryWidthEnd - secondaryWidthStart < 200 ? 200 : secondaryWidthEnd - secondaryWidthStart;
        const primaryWidth = outer!.width - secondaryWidth;
        // -2 因为resizer占4个
        this.primaryPanel!.size.width = primaryWidth - 2;
        this.secondaryPanel!.size.width = secondaryWidth - 2;
        //console.log('mousemove', sideBarWidth, mainPanelWidth);
        this.updateView();
    }, 100);
    let downHandler = (e: MouseEvent) => {
        return;
    };
    const uphandler = (e: MouseEvent) => {
        console.log('[PanelManager] Mouseup, remove listener');
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
        outer = this.resizers!.primaryPanel2secondaryPanel.outerContainer.getBoundingClientRect();
        console.log('[PanelManager] PrimarySecondaryPanel resizing.');
        document.addEventListener('mousemove', movehandler);
        document.addEventListener('mouseup', uphandler);
    };
    resizer?.addEventListener('mousedown', downHandler);
}
