import { BrowserWindow } from 'electron';
import { IWindowList } from '@/main/window/constants';
import { IAppNotification } from './types';
declare interface IWindowListItem {
    isValid: boolean;
    multiple: boolean;
    options: () => IBrowserWindowOptions;
    callback: (window: BrowserWindow, windowManager: IWindowManager) => void;
}

declare interface IWindowManager {
    create: (name: IWindowList, config?: any) => BrowserWindow | null;
    get: (name: IWindowList) => BrowserWindow | null;
    has: (name: IWindowList) => boolean;
    // delete: (name: IWindowList) => void
    deleteById: (id: number) => void;
    // getAvailableWindow: () => BrowserWindow;
}

// https://stackoverflow.com/questions/35074713/extending-typescript-global-object-in-node-js/44387594#44387594
declare global {
    namespace NodeJS {
        interface Global {
            SALTDOG_VERSION: string;
            notificationList?: IAppNotification[];
            //
        }
    }
}
