import {ipcRenderer} from 'electron';

class DBProxy {
    private DB_IPC = 'DBSYNC';
    read() {
        return ipcRenderer.sendSync(this.DB_IPC,'read');
    }
    get(key = '') {
        return ipcRenderer.sendSync(this.DB_IPC,'get',key);
    }
    set(key: string, value: any) {
        return ipcRenderer.sendSync(this.DB_IPC,'set',key,value);
    }
    has(key: string) {
        return ipcRenderer.sendSync(this.DB_IPC,'has',key);
    }
    insert(key: string, value: any): void {
        // @ts-ignore
        return ipcRenderer.sendSync(this.DB_IPC,'insert',key,value);
    }
    unset(key: string, value: any): boolean {
        return ipcRenderer.sendSync(this.DB_IPC,'unset',key,value);
    }
    getById(key: string, id: string) {
        // @ts-ignore
        return ipcRenderer.sendSync(this.DB_IPC,'getById',key,id);
    }
    removeById(key: string, id: string) {
        // @ts-ignore
        return ipcRenderer.sendSync(this.DB_IPC,'removeById',key,id);
    }
    getConfigPath() {
        return ipcRenderer.sendSync(this.DB_IPC,'getConfigPath');
    }
}

export default new DBProxy();