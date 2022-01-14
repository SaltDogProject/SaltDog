import { BrowserWindow } from 'electron';
import { IWindowManager, IWindowListItem } from '#/types/electron';
import windowList from './windowList';
import { IWindowList } from './constants';

class WindowManager implements IWindowManager {
    private a = 1;
    private windowMap: Map<IWindowList | string, BrowserWindow> = new Map();
    private windowIdMap: Map<number, IWindowList | string> = new Map();
    private windowConfig: Map<number, any> = new Map();
    create(name: IWindowList, config?: any) {
        const windowConfig: IWindowListItem = windowList.get(name)!;
        if (windowConfig.isValid) {
            if (!windowConfig.multiple) {
                if (this.has(name)) return this.windowMap.get(name)!;
            }
            const window = new BrowserWindow(windowConfig.options());
            const id = window.id;
            if (windowConfig.multiple) {
                this.windowMap.set(`${name}_${window.id}`, window);
                this.windowIdMap.set(window.id, `${name}_${window.id}`);
            } else {
                this.windowMap.set(name, window);
                this.windowIdMap.set(window.id, name);
            }
            // block x-frame-options
            window.webContents.session.webRequest.onHeadersReceived({ urls: ['*://*/*'] }, (d, c) => {
                if (d.responseHeaders && d.responseHeaders['X-Frame-Options']) {
                    delete d.responseHeaders['X-Frame-Options'];
                } else if (d.responseHeaders && d.responseHeaders['x-frame-options']) {
                    delete d.responseHeaders['x-frame-options'];
                }

                c({ cancel: false, responseHeaders: d.responseHeaders });
            });
            if (config) this.windowConfig.set(window.id, config);
            windowConfig.callback(window, this);
            window.on('close', () => {
                this.deleteById(id);
            });
            return window;
        } else {
            return null;
        }
    }
    get(name: IWindowList) {
        if (this.windowMap.has(name)) {
            return this.windowMap.get(name)!;
        } else return null;
        // else {
        //     const window = this.create(name);
        //     return window;
        // }
    }
    getConfig(id: number) {
        return this.windowConfig.get(id);
    }
    has(name: IWindowList) {
        return this.windowMap.has(name);
    }
    // useless
    // delete (name: IWindowList) {
    //   const window = this.windowMap.get(name)
    //   if (window) {
    //     this.windowIdMap.delete(window.id)
    //     this.windowMap.delete(name)
    //   }
    // }
    deleteById = (id: number) => {
        const name = this.windowIdMap.get(id);
        if (name) {
            this.windowMap.delete(name);
            this.windowIdMap.delete(id);
        }
    };
    getById = (id: number | string) => {
        if (typeof id === 'string') {
            id = parseInt(id);
        }
        const name = this.windowIdMap.get(id);
        if (name) {
            return this.windowMap.get(name)!;
        } else return null;
    };

    closeById = (id: number) => {
        const name = this.windowIdMap.get(id);
        console.log('close id', name);
        if (name) {
            this.windowMap.get(name)!.close();
        }
        this.deleteById(id);
    };
    minimizeById = (id: number) => {
        const name = this.windowIdMap.get(id);
        if (name) {
            this.windowMap.get(name)!.minimize();
        }
    };
}

export default new WindowManager();
