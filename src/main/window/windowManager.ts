import { BrowserWindow } from 'electron';
import { IWindowManager, IWindowListItem } from '#/types/electron';
import windowList from './windowList';
import { IWindowList } from './constants';

class WindowManager implements IWindowManager {
    private a = 1;
    private windowMap: Map<IWindowList | string, BrowserWindow> = new Map();
    private windowIdMap: Map<number, IWindowList | string> = new Map();
    create(name: IWindowList) {
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
        if (this.has(name)) {
            return this.windowMap.get(name)!;
        } else {
            const window = this.create(name);
            return window;
        }
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
}

export default new WindowManager();
